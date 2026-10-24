"use client";

import { useEffect, useRef } from "react";

/**
 * Soft heart trail that follows the cursor / finger.
 * Respects reduced-motion. Very light so it never feels busy.
 */
export default function HeartTrail() {
  const canvasRef = useRef(null);
  const hearts = useRef([]);
  const pointer = useRef({ x: -999, y: -999, moving: false });
  const lastSpawn = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const fit = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();

    const cols = ["#ff8fb0", "#ffb3c9", "#e8a0ff", "#ffc78a", "#ffffff"];

    const drawHeart = (x, y, s, rot, col, a) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(s, s);
      ctx.globalAlpha = a;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(0, 2.2);
      ctx.bezierCurveTo(0, -1.2, -3.2, -1.6, -3.2, 0.9);
      ctx.bezierCurveTo(-3.2, 2.8, 0, 4.2, 0, 5.8);
      ctx.bezierCurveTo(0, 4.2, 3.2, 2.8, 3.2, 0.9);
      ctx.bezierCurveTo(3.2, -1.6, 0, -1.2, 0, 2.2);
      ctx.fill();
      ctx.restore();
    };

    const onMove = (x, y) => {
      pointer.current = { x, y, moving: true };
      const now = performance.now();
      if (now - lastSpawn.current > 38) {
        lastSpawn.current = now;
        hearts.current.push({
          x,
          y,
          s: 0.55 + Math.random() * 0.7,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.04,
          vy: -(0.35 + Math.random() * 0.55),
          vx: (Math.random() - 0.5) * 0.4,
          a: 0.55 + Math.random() * 0.35,
          life: 1,
          col: cols[(Math.random() * cols.length) | 0],
        });
        if (hearts.current.length > 42) hearts.current.shift();
      }
    };

    const onPointer = (e) => {
      const t = e.touches ? e.touches[0] : e;
      if (t) onMove(t.clientX, t.clientY);
    };
    const onLeave = () => {
      pointer.current.moving = false;
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("touchmove", onPointer, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", fit);

    let raf;
    const loop = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      hearts.current = hearts.current.filter((h) => h.life > 0.02);
      hearts.current.forEach((h) => {
        h.x += h.vx;
        h.y += h.vy;
        h.rot += h.vr;
        h.life -= 0.018;
        h.a *= 0.965;
        drawHeart(h.x, h.y, h.s * h.life, h.rot, h.col, h.a * h.life);
      });
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("touchmove", onPointer);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", fit);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="heart-trail"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        pointerEvents: "none",
      }}
    />
  );
}
