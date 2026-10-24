"use client";

import { useEffect, useRef, useState } from "react";

/* Hand-drawn filigree dividers that ink themselves in when they scroll
   into view. Three variants so repeated pages don't feel repeated. */

const SHAPES = {
  flourish: (
    <>
      <path d="M8 20 C 60 20 70 8 100 8 C 118 8 124 20 112 26 C 103 30 96 24 104 19" />
      <path d="M232 20 C 180 20 170 8 140 8 C 122 8 116 20 128 26 C 137 30 144 24 136 19" />
      <path d="M120 14 c -6 -7 -16 -3 -16 4 c 0 6 9 11 16 18 c 7 -7 16 -12 16 -18 c 0 -7 -10 -11 -16 -4 z" className="orn-fill" />
      <path d="M22 20 l -10 -5 M22 20 l -10 5 M218 20 l 10 -5 M218 20 l 10 5" />
    </>
  ),
  stars: (
    <>
      <path d="M14 20 H 96" />
      <path d="M144 20 H 226" />
      <path d="M120 6 L 123.4 16.6 L 134 20 L 123.4 23.4 L 120 34 L 116.6 23.4 L 106 20 L 116.6 16.6 Z" className="orn-fill" />
      <circle cx="100" cy="20" r="2.2" className="orn-fill" />
      <circle cx="140" cy="20" r="2.2" className="orn-fill" />
      <circle cx="86" cy="20" r="1.3" className="orn-fill" />
      <circle cx="154" cy="20" r="1.3" className="orn-fill" />
    </>
  ),
  knot: (
    <>
      <path d="M12 20 C 52 20 60 10 80 10 C 96 10 100 20 120 20 C 140 20 144 10 160 10 C 180 10 188 20 228 20" />
      <path d="M12 20 C 52 20 60 30 80 30 C 96 30 100 20 120 20 C 140 20 144 30 160 30 C 180 30 188 20 228 20" />
      <circle cx="120" cy="20" r="3" className="orn-fill" />
    </>
  ),
};

export default function Ornament({ variant = "flourish", label }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className={"ornament" + (on ? " on" : "")} ref={ref} aria-hidden={!label}>
      <svg viewBox="0 0 240 40" role={label ? "img" : undefined} aria-label={label}>
        <g className="orn-g">{SHAPES[variant] || SHAPES.flourish}</g>
      </svg>
    </div>
  );
}
