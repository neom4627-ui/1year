"use client";

import { useEffect, useRef, useState } from "react";
import { burst } from "../../lib/fx";

/**
 * Pure CSS/SVG 3D heart — tilts toward the pointer, spins on tap.
 * No Three.js. Light enough for phones.
 */
export default function Heart3D({ size = 128, interactive = true }) {
  const wrapRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 10, y: -14 });
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    if (!interactive) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const el = wrapRef.current;
    if (!el) return;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const t = e.touches ? e.touches[0] : e;
      if (!t) return;
      const dx = (t.clientX - cx) / Math.max(rect.width / 2, 1);
      const dy = (t.clientY - cy) / Math.max(rect.height / 2, 1);
      setTilt({
        x: Math.max(-16, Math.min(16, dy * -12)),
        y: Math.max(-20, Math.min(20, dx * 15)),
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [interactive]);

  const onTap = () => {
    if (spinning) return;
    setSpinning(true);
    burst(28);
    setTimeout(() => setSpinning(false), 1300);
  };

  const layers = [
    { z: 14, scale: 1, opacity: 1, fill: "url(#g0)" },
    { z: 8, scale: 0.96, opacity: 0.92, fill: "url(#g1)" },
    { z: 2, scale: 0.92, opacity: 0.78, fill: "url(#g2)" },
    { z: -4, scale: 0.88, opacity: 0.55, fill: "#c0456e" },
    { z: -10, scale: 0.84, opacity: 0.35, fill: "#a0385c" },
  ];

  return (
    <div
      ref={wrapRef}
      className={"heart3d-scene" + (spinning ? " spin" : "")}
      style={{ width: size, height: size }}
      onClick={onTap}
      role="button"
      tabIndex={0}
      aria-label="A heart that moves with you — tap to spin"
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onTap()}
    >
      <div
        className="heart3d"
        style={{
          width: "100%",
          height: "100%",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        {layers.map((L, i) => (
          <svg
            key={i}
            className="heart3d-svg"
            viewBox="0 0 100 100"
            style={{
              transform: `translateZ(${L.z}px) scale(${L.scale})`,
              opacity: L.opacity,
            }}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={`h3d-g${i}`} x1="20%" y1="10%" x2="80%" y2="90%">
                <stop offset="0%" stopColor={i === 0 ? "#ffc2d4" : "#ff9ebd"} />
                <stop offset="55%" stopColor={i < 2 ? "#e4648a" : "#d9527c"} />
                <stop offset="100%" stopColor={i === 0 ? "#c93d6e" : "#b03a5e"} />
              </linearGradient>
            </defs>
            <path
              d="M50 88 C22 66 4 48 4 30 C4 14 16 4 30 4 C40 4 47 10 50 18 C53 10 60 4 70 4 C84 4 96 14 96 30 C96 48 78 66 50 88 Z"
              fill={typeof L.fill === "string" && L.fill.startsWith("#") ? L.fill : `url(#h3d-g${i})`}
            />
            {i === 0 && (
              <ellipse cx="34" cy="28" rx="12" ry="8" fill="rgba(255,255,255,.35)" />
            )}
          </svg>
        ))}
      </div>
      <p className="heart3d-hint">tap me</p>
    </div>
  );
}
