"use client";

import { useEffect, useRef } from "react";
import { burst } from "../../lib/fx";

/* A heart that assembles itself out of a few hundred points of light,
   breathes like a real heartbeat, scatters when touched and finds its
   shape again. The maths is the classic heart curve:

      x = 16 sin³t          y = 13 cos t − 5 cos2t − 2 cos3t − cos4t

   Points are seeded across the whole area (not just the outline) with
   a bias toward the edge, so it has a glowing rim and a soft interior. */

/* One sprite per colour, drawn once into an offscreen canvas and then
   blitted. Building a radial gradient per particle per frame looks the
   same and costs about a hundred times more — enough to drop the whole
   page to a slideshow on a phone. */
const SPRITE = 48;
function makeSprite(col, specular) {
  const c = document.createElement("canvas");
  c.width = c.height = SPRITE;
  const x = c.getContext("2d");
  const h = SPRITE / 2;
  const g = x.createRadialGradient(h, h, 0, h, h, h);
  g.addColorStop(0, col);
  g.addColorStop(0.17, col);
  g.addColorStop(0.34, col + "66");
  g.addColorStop(1, col + "00");
  x.fillStyle = g;
  x.beginPath();
  x.arc(h, h, h, 0, 7);
  x.fill();
  if (specular) {
    x.fillStyle = "rgba(255,246,250,.92)";
    x.beginPath();
    x.arc(h - SPRITE * 0.045, h - SPRITE * 0.045, SPRITE * 0.07, 0, 7);
    x.fill();
  }
  return c;
}

function heartPoint(t, k) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y =
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t);
  return { x: x * k, y: -y * k };
}

export default function ParticleHeart({ size = 260, count }) {
  const canvasRef = useRef(null);
  const hostRef = useRef(null);
  const stateRef = useRef({ parts: [], beat: 0, scatter: 0, pointer: null });

  const scatter = () => {
    const st = stateRef.current;
    st.scatter = 1;
    st.parts.forEach((p) => {
      const a = Math.random() * Math.PI * 2;
      const f = 2.6 + Math.random() * 6.4;
      p.vx += Math.cos(a) * f;
      p.vy += Math.sin(a) * f;
    });
    burst(34);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0, dpr = 1;
    let sprites = [];
    const st = stateRef.current;

    const seed = () => {
      const box = host.getBoundingClientRect();
      W = Math.max(160, box.width);
      H = Math.max(160, box.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const k = Math.min(W, H) / 40;
      const n = count || (W < 300 ? 460 : 700);
      /* Saturated, not pale: these are painted over a pastel page, so a
         pale particle simply disappears into it. */
      const warm = ["#ff5f93", "#e4648a", "#ff87ae", "#f0943c", "#c9418a"];
      sprites = warm.map((c) => [makeSprite(c, false), makeSprite(c, true)]);

      st.parts = Array.from({ length: n }, (_, idx) => {
        /* Two thirds of the points sit in a tight band on the curve
           itself — that is what makes the silhouette legible. The rest
           fill the inside faintly so it isn't a hollow outline.
           Rim points are spaced evenly round the curve rather than
           randomly, so there are no gaps in the outline. */
        const rim = idx % 3 !== 0;
        const t = rim
          ? ((idx / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.045)
          : Math.random() * Math.PI * 2;
        const rad = rim
          ? 0.965 + Math.random() * 0.035
          : 0.18 + Math.pow(Math.random(), 0.62) * 0.72;
        const tgt = heartPoint(t, k);
        return {
          tx: W / 2 + tgt.x * rad,
          ty: H / 2 + tgt.y * rad + Math.min(W, H) * 0.04,
          x: W / 2 + (Math.random() - 0.5) * W * 1.5,
          y: H / 2 + (Math.random() - 0.5) * H * 1.5,
          vx: 0,
          vy: 0,
          r: rim ? 0.95 + Math.random() * 0.75 : 0.5 + Math.random() * 0.55,
          a: rim ? 0.82 + Math.random() * 0.18 : 0.2 + Math.random() * 0.26,
          ease: 0.034 + Math.random() * 0.05,
          ci: (Math.random() * warm.length) | 0,
          p: Math.random() * 6,
          ps: 0.02 + Math.random() * 0.05,
          rim,
        };
      });
    };

    seed();

    const onPointer = (e) => {
      const box = canvas.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      if (!t) return;
      const x = t.clientX - box.left;
      const y = t.clientY - box.top;
      /* Stamped with a time: a pointer that has stopped moving — or a
         finger that has lifted, which fires no further events — must
         stop pushing, or the heart never settles into its shape. */
      st.pointer =
        x > -80 && x < W + 80 && y > -80 && y < H + 80
          ? { x, y, t: performance.now() }
          : null;
    };
    const dropPointer = () => { st.pointer = null; };

    let raf;
    let last = performance.now();
    const loop = (now) => {
      /* Stepped against the clock, not against frames. On a slow phone
         the page may only manage fifteen frames a second; the heart
         should still take the same second and a half to pull itself
         together, not ten. */
      const elapsed = Math.min(120, now - last);
      last = now;
      const steps = Math.max(1, Math.min(5, Math.round(elapsed / 16.7)));

      st.beat += (elapsed / 1000) * 0.96;
      if (st.scatter > 0) st.scatter = Math.max(0, st.scatter - elapsed * 0.00054);

      /* double-thump heartbeat rather than a sine wave */
      const cyc = st.beat % 1;
      const thump =
        Math.exp(-Math.pow((cyc - 0.06) / 0.07, 2)) * 1 +
        Math.exp(-Math.pow((cyc - 0.26) / 0.085, 2)) * 0.62;
      const pulse = 1 + thump * 0.045;

      ctx.clearRect(0, 0, W, H);

      /* the push fades out over half a second of stillness */
      const age = st.pointer ? performance.now() - st.pointer.t : Infinity;
      const pointerPower = age < 160 ? 1 : age < 620 ? 1 - (age - 160) / 460 : 0;

      const cxm = W / 2;
      const cym = H / 2 + Math.min(W, H) * 0.04;

      st.parts.forEach((p) => {
        const tx = cxm + (p.tx - cxm) * pulse;
        const ty = cym + (p.ty - cym) * pulse;

        for (let s = 0; s < steps; s++) {
          p.vx += (tx - p.x) * p.ease;
          p.vy += (ty - p.y) * p.ease;

          if (st.pointer && pointerPower > 0) {
            const dx = p.x - st.pointer.x;
            const dy = p.y - st.pointer.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 6400 && d2 > 1) {
              const f = (1 - d2 / 6400) * 2.2 * pointerPower;
              const d = Math.sqrt(d2);
              p.vx += (dx / d) * f;
              p.vy += (dy / d) * f;
            }
          }

          p.vx *= 0.86;
          p.vy *= 0.86;
          p.x += p.vx;
          p.y += p.vy;
        }
        p.p += p.ps * steps;

        const tw = 0.6 + Math.abs(Math.sin(p.p)) * 0.4;
        const alpha = p.a * tw * (0.78 + thump * 0.26);
        const rad = p.r * (p.rim ? 1 + thump * 0.3 : 1);
        const d = rad * 7.4;

        ctx.globalAlpha = alpha;
        ctx.drawImage(sprites[p.ci][p.rim ? 1 : 0], p.x - d / 2, p.y - d / 2, d, d);
      });

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };

    if (reduce) {
      /* settle it instantly and draw one still frame */
      st.parts.forEach((p) => {
        p.x = p.tx;
        p.y = p.ty;
        const d = p.r * 7.4;
        ctx.globalAlpha = p.a;
        ctx.drawImage(sprites[p.ci][p.rim ? 1 : 0], p.x - d / 2, p.y - d / 2, d, d);
      });
    } else {
      loop(performance.now());
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("pointerup", dropPointer, { passive: true });
      window.addEventListener("pointercancel", dropPointer, { passive: true });
      window.addEventListener("blur", dropPointer);
    }

    const onResize = () => seed();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerup", dropPointer);
      window.removeEventListener("pointercancel", dropPointer);
      window.removeEventListener("blur", dropPointer);
      window.removeEventListener("resize", onResize);
    };
  }, [count]);

  return (
    <div
      ref={hostRef}
      className="pheart"
      style={{ width: size, height: size }}
      onClick={scatter}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), scatter())}
      role="button"
      tabIndex={0}
      aria-label="A heart made of light. Touch it to scatter it."
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      <span className="pheart-hint">touch it</span>
    </div>
  );
}
