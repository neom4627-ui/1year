"use client";

import { useEffect, useRef } from "react";
import { registerBurst } from "../../lib/fx";

/* ───────────────────────── shape painters ─────────────────────────
   Everything is drawn by hand so the whole atmosphere is one canvas
   and one animation frame instead of a pile of DOM nodes. */

function heartPath(ctx) {
  ctx.beginPath();
  ctx.moveTo(0, 3);
  ctx.bezierCurveTo(0, -1, -4, -1.5, -4, 1.5);
  ctx.bezierCurveTo(-4, 4, 0, 5.5, 0, 8);
  ctx.bezierCurveTo(0, 5.5, 4, 4, 4, 1.5);
  ctx.bezierCurveTo(4, -1.5, 0, -1, 0, 3);
}

function drawHeart(ctx, x, y, s, rot, col, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(s, s);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = col;
  heartPath(ctx);
  ctx.fill();
  ctx.restore();
}

/* A four-point sparkle — the thing that makes confetti read as "magic"
   rather than "party". */
function drawSparkle(ctx, x, y, s, rot, col, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(s, s);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.quadraticCurveTo(1.1, -1.1, 7, 0);
  ctx.quadraticCurveTo(1.1, 1.1, 0, 7);
  ctx.quadraticCurveTo(-1.1, 1.1, -7, 0);
  ctx.quadraticCurveTo(-1.1, -1.1, 0, -7);
  ctx.fill();
  ctx.restore();
}

/* A curling ribbon: two arcs with a highlight, so it catches light. */
function drawRibbon(ctx, x, y, s, rot, col, alpha, phase) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const squash = Math.cos(phase);
  ctx.scale(s, s * Math.max(0.18, Math.abs(squash)));
  ctx.globalAlpha = alpha;
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(-3.4, -5, 6.8, 10, 2) : ctx.rect(-3.4, -5, 6.8, 10);
  ctx.fill();
  ctx.globalAlpha = alpha * 0.45;
  ctx.fillStyle = "#fff";
  ctx.fillRect(-3.4, -5, 2.1, 10);
  ctx.restore();
}

/* Soft out-of-focus light. Drawn as a radial gradient so it reads as
   depth rather than as a flat dot. */
function drawBokeh(ctx, x, y, r, col, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, col.replace("ALPHA", (alpha * 0.9).toFixed(3)));
  g.addColorStop(0.55, col.replace("ALPHA", (alpha * 0.35).toFixed(3)));
  g.addColorStop(1, col.replace("ALPHA", "0"));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 7);
  ctx.fill();
}

function fit(canvas) {
  if (!canvas) return;
  const r = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * r;
  canvas.height = window.innerHeight * r;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  canvas.getContext("2d").setTransform(r, 0, 0, r, 0, 0);
}

export default function Background({ starry }) {
  const ambientRef = useRef(null);
  const burstRef = useRef(null);
  const skyRef = useRef(null);
  const parallaxRef = useRef(null);

  const bitsRef = useRef([]);
  const burstRaf = useRef(null);
  const skyRaf = useRef(null);

  /* Self-tuning quality. Rather than guessing at her phone from the user
     agent, watch the first two seconds of real frames: if the device
     can't hold a smooth rate, drop the most expensive decoration (the
     grain's blend mode, the second aurora sheet, the breathing
     vignette). The page stays beautiful and stops stuttering, and a fast
     phone never pays for the caution. */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frames = 0;
    let raf;
    const t0 = performance.now();
    const tick = () => {
      frames++;
      const dt = performance.now() - t0;
      if (dt < 2000) raf = requestAnimationFrame(tick);
      else if (frames / (dt / 1000) < 38) {
        document.documentElement.classList.add("lite");
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* Pointer/scroll parallax. One listener, written into CSS variables,
     so the aurora, the blobs and the vignette all drift together
     without React re-rendering anything. */
  useEffect(() => {
    const host = parallaxRef.current;
    if (!host) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let tx = 0, ty = 0, cx = 0, cy = 0, raf;
    const onMove = (e) => {
      const t = e.touches ? e.touches[0] : e;
      if (!t) return;
      tx = (t.clientX / window.innerWidth - 0.5) * 2;
      ty = (t.clientY / window.innerHeight - 0.5) * 2;
    };
    const loop = () => {
      cx += (tx - cx) * 0.045;
      cy += (ty - cy) * 0.045;
      const r = document.documentElement;
      r.style.setProperty("--px", cx.toFixed(4));
      r.style.setProperty("--py", cy.toFixed(4));
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  /* Ambient layer: depth-sorted bokeh, dust motes and drifting hearts.
     Three sizes of thing moving at three speeds is what sells depth. */
  useEffect(() => {
    const c = ambientRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 620;
    fit(c);

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    const heartCols = ["#ff9ebd", "#ffc78a", "#c3a6ff", "#9fd8ff", "#ffffff"];
    const bokehCols = [
      "rgba(255,170,200,ALPHA)",
      "rgba(255,214,150,ALPHA)",
      "rgba(196,166,255,ALPHA)",
      "rgba(160,220,255,ALPHA)",
      "rgba(255,255,255,ALPHA)",
    ];

    const hearts = Array.from({ length: small ? 12 : 20 }, () => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      s: 0.9 + Math.random() * 1.8,
      vy: -(0.12 + Math.random() * 0.38),
      vx: (Math.random() - 0.5) * 0.26,
      rot: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.012,
      a: 0.16 + Math.random() * 0.3,
      c: heartCols[(Math.random() * heartCols.length) | 0],
    }));

    const bokeh = Array.from({ length: small ? 7 : 12 }, () => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      r: 26 + Math.random() * 74,
      vy: -(0.05 + Math.random() * 0.14),
      vx: (Math.random() - 0.5) * 0.1,
      a: 0.1 + Math.random() * 0.2,
      p: Math.random() * 6,
      ps: 0.004 + Math.random() * 0.008,
      c: bokehCols[(Math.random() * bokehCols.length) | 0],
    }));

    const dust = Array.from({ length: small ? 34 : 70 }, () => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      r: 0.4 + Math.random() * 1.1,
      vy: -(0.04 + Math.random() * 0.2),
      vx: (Math.random() - 0.5) * 0.14,
      a: 0.12 + Math.random() * 0.4,
      p: Math.random() * 6,
      ps: 0.01 + Math.random() * 0.03,
    }));

    let raf;
    const frame = (animate) => {
      ctx.clearRect(0, 0, W(), H());

      /* far layer */
      bokeh.forEach((b) => {
        if (animate) {
          b.y += b.vy;
          b.x += b.vx;
          b.p += b.ps;
          if (b.y < -b.r) { b.y = H() + b.r; b.x = Math.random() * W(); }
        }
        drawBokeh(ctx, b.x, b.y, b.r, b.c, b.a * (0.7 + Math.sin(b.p) * 0.3));
      });

      /* mid layer */
      ctx.save();
      dust.forEach((d) => {
        if (animate) {
          d.y += d.vy;
          d.x += d.vx + Math.sin(d.y / 90) * 0.12;
          d.p += d.ps;
          if (d.y < -4) { d.y = H() + 4; d.x = Math.random() * W(); }
        }
        ctx.globalAlpha = d.a * (0.45 + Math.abs(Math.sin(d.p)) * 0.55);
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, 7);
        ctx.fill();
      });
      ctx.restore();

      /* near layer */
      hearts.forEach((p) => {
        if (animate) {
          p.y += p.vy;
          p.x += p.vx + Math.sin(p.y / 70) * 0.2;
          p.rot += p.vr;
          if (p.y < -20) { p.y = H() + 20; p.x = Math.random() * W(); }
        }
        drawHeart(ctx, p.x, p.y, p.s, p.rot, p.c, p.a);
      });
    };

    const loop = () => {
      frame(true);
      raf = requestAnimationFrame(loop);
    };
    if (reduce) frame(false);
    else loop();

    const onResize = () => fit(c);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  /* Celebration, driven by lib/fx burst(). Hearts, sparkles and curling
     ribbons, each with its own drag and spin, fading as they fall. */
  useEffect(() => {
    const c = burstRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const cols = ["#ff8fb0", "#ffc46b", "#b388ff", "#7fd0ff", "#8ee0b4", "#ffffff"];
    const golds = ["#ffe6a8", "#fff6e0", "#ffd98a"];

    const loop = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      bitsRef.current = bitsRef.current.filter(
        (b) => b.y < window.innerHeight + 60 && b.life > 0
      );
      bitsRef.current.forEach((b) => {
        b.life -= 0.0042;
        b.y += b.vy;
        b.x += b.vx + Math.sin(b.y / 48 + b.seed) * b.sway;
        b.rot += b.vr;
        b.vy += 0.012;
        b.vx *= 0.997;
        b.phase += b.pv;
        const a = Math.min(1, b.life * 2.4) * 0.95;
        if (b.kind === 0) drawHeart(ctx, b.x, b.y, b.s, b.rot, b.c, a);
        else if (b.kind === 1) drawSparkle(ctx, b.x, b.y, b.s * 0.46, b.rot, b.c, a);
        else drawRibbon(ctx, b.x, b.y, b.s * 0.9, b.rot, b.c, a, b.phase);
      });
      if (bitsRef.current.length) burstRaf.current = requestAnimationFrame(loop);
      else {
        burstRaf.current = null;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };

    const unregister = registerBurst((n) => {
      fit(c);
      const small = window.innerWidth < 620;
      const cap = small ? Math.round(n * 0.65) : n;
      for (let i = 0; i < cap; i++) {
        const kind = Math.random() < 0.52 ? 0 : Math.random() < 0.62 ? 1 : 2;
        bitsRef.current.push({
          kind,
          x: window.innerWidth / 2 + (Math.random() - 0.5) * window.innerWidth * 0.78,
          y: -16 - Math.random() * 240,
          s: 0.9 + Math.random() * 1.7,
          vy: 0.85 + Math.random() * 2.1,
          vx: (Math.random() - 0.5) * 1.3,
          rot: Math.random() * 6,
          vr: (Math.random() - 0.5) * 0.16,
          sway: 0.1 + Math.random() * 0.3,
          seed: Math.random() * 6,
          phase: Math.random() * 6,
          pv: 0.05 + Math.random() * 0.09,
          life: 1,
          c: kind === 1
            ? golds[(Math.random() * golds.length) | 0]
            : cols[(Math.random() * cols.length) | 0],
        });
      }
      if (!burstRaf.current) loop();
    });

    const onResize = () => fit(c);
    window.addEventListener("resize", onResize);
    return () => {
      unregister();
      cancelAnimationFrame(burstRaf.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  /* Night sky for the finale: layered stars with real twinkle, a faint
     milky band, and shooting stars that cross every few seconds. */
  useEffect(() => {
    const c = skyRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!starry) {
      cancelAnimationFrame(skyRaf.current);
      skyRaf.current = null;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      return;
    }

    fit(c);
    const W = () => window.innerWidth;
    const H = () => window.innerHeight;
    const small = W() < 620;

    const stars = Array.from({ length: small ? 110 : 210 }, () => {
      const depth = Math.random();
      return {
        x: Math.random() * W(),
        y: Math.random() * H(),
        r: 0.3 + depth * 1.5,
        p: Math.random() * 6,
        s: 0.006 + Math.random() * 0.026,
        depth,
        warm: Math.random() < 0.72,
        big: depth > 0.93,
      };
    });

    /* A soft diagonal band of light, like a galaxy seen from a terrace. */
    const band = () => {
      const g = ctx.createLinearGradient(0, H() * 0.1, W(), H() * 0.85);
      g.addColorStop(0, "rgba(255,236,210,0)");
      g.addColorStop(0.42, "rgba(226,214,255,0.055)");
      g.addColorStop(0.55, "rgba(255,232,208,0.075)");
      g.addColorStop(1, "rgba(180,200,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W(), H());
    };

    let shooters = [];
    let nextShot = 1200;
    let last = performance.now();

    const spawnShooter = () => {
      const fromLeft = Math.random() < 0.6;
      shooters.push({
        x: fromLeft ? -60 : W() * (0.4 + Math.random() * 0.6),
        y: H() * (0.04 + Math.random() * 0.42),
        vx: (fromLeft ? 1 : -1) * (7 + Math.random() * 5),
        vy: 2.2 + Math.random() * 2.4,
        len: 90 + Math.random() * 150,
        life: 1,
      });
    };

    const loop = (now) => {
      const dt = Math.min(48, now - last);
      last = now;
      ctx.clearRect(0, 0, W(), H());
      band();

      stars.forEach((s) => {
        s.p += s.s;
        const tw = 0.25 + Math.abs(Math.sin(s.p)) * 0.7;
        ctx.fillStyle = s.warm
          ? `rgba(255,240,215,${(tw * (0.35 + s.depth * 0.65)).toFixed(3)})`
          : `rgba(214,226,255,${(tw * (0.3 + s.depth * 0.6)).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 7);
        ctx.fill();
        /* the brightest few get a cross-flare */
        if (s.big) {
          ctx.save();
          ctx.globalAlpha = tw * 0.5;
          ctx.strokeStyle = "rgba(255,244,222,.9)";
          ctx.lineWidth = 0.6;
          const f = s.r * 4.5;
          ctx.beginPath();
          ctx.moveTo(s.x - f, s.y); ctx.lineTo(s.x + f, s.y);
          ctx.moveTo(s.x, s.y - f); ctx.lineTo(s.x, s.y + f);
          ctx.stroke();
          ctx.restore();
        }
      });

      nextShot -= dt;
      if (nextShot <= 0) {
        spawnShooter();
        nextShot = 2600 + Math.random() * 5200;
      }
      shooters = shooters.filter((s) => s.life > 0 && s.x < W() + 200 && s.x > -200);
      shooters.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.006;
        const tailX = s.x - (s.vx / Math.hypot(s.vx, s.vy)) * s.len;
        const tailY = s.y - (s.vy / Math.hypot(s.vx, s.vy)) * s.len;
        const g = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        g.addColorStop(0, `rgba(255,248,230,${(s.life * 0.95).toFixed(3)})`);
        g.addColorStop(1, "rgba(255,248,230,0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.7;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      });

      if (!reduce) skyRaf.current = requestAnimationFrame(loop);
    };
    loop(performance.now());

    const onResize = () => fit(c);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(skyRaf.current);
      skyRaf.current = null;
      window.removeEventListener("resize", onResize);
    };
  }, [starry]);

  return (
    <>
      <div id="blobs" ref={parallaxRef}>
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
        <div className="blob b4" />
      </div>

      {/* Two slow sheets of light crossing each other. This is what makes
          the background read as silk instead of as blurred circles. */}
      <div id="aurora" aria-hidden="true">
        <span className="a1" />
        <span className="a2" />
      </div>

      <canvas id="sky" ref={skyRef} className={starry ? "on" : ""} />
      <canvas id="petals" ref={ambientRef} />
      <canvas id="burst" ref={burstRef} />

      {/* Lens treatment, always last: a breathing vignette and a fine
          grain. Both are what stop a pastel gradient looking flat. */}
      <div id="vignette" aria-hidden="true" />
      <div id="grain" aria-hidden="true" />
    </>
  );
}
