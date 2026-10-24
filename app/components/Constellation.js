"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { apiGet } from "../../lib/api";

/* Every memory in the vault becomes a star.

   The positions are derived from each memory's id, not random, so a star
   sits in the same place every time she opens it. A sky that reshuffles
   on every visit isn't a map of anything.

   Brighter stars are the memories you've both written a side of.
*/

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function place(id, i, total) {
  const h = hash(id);
  // Spread along a gentle arc so early memories sit left, later ones right,
  // with enough jitter that it reads as a sky and not a chart axis.
  const t = total > 1 ? i / (total - 1) : 0.5;
  const x = 60 + t * 320 + ((h % 70) - 35) * 0.6;
  const y = 120 - Math.sin(t * Math.PI) * 55 + (((h >> 7) % 80) - 40) * 0.8;
  return { x: Math.max(28, Math.min(412, x)), y: Math.max(30, Math.min(205, y)) };
}

export default function Constellation() {
  const [items, setItems] = useState([]);
  const [sel, setSel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const canvas = useRef(null);

  useEffect(() => {
    apiGet("/api/memories")
      .then((d) => setItems([...d.items].reverse()))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  const stars = useMemo(
    () => items.map((m, i) => ({ ...m, ...place(m.id, i, items.length) })),
    [items]
  );

  /* faint background starfield so an empty sky still looks like a sky */
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const r = Math.min(window.devicePixelRatio || 1, 2);
    const w = c.clientWidth;
    const h = c.clientHeight;
    c.width = w * r;
    c.height = h * r;
    ctx.setTransform(r, 0, 0, r, 0, 0);
    const dust = Array.from({ length: 90 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.1 + 0.2,
      a: 0.1 + Math.random() * 0.4,
    }));
    ctx.clearRect(0, 0, w, h);
    dust.forEach((d) => {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, 7);
      ctx.fillStyle = `rgba(255,240,215,${d.a})`;
      ctx.fill();
    });
  }, [loading]);

  if (loading) return <p className="statusline">Finding the sky…</p>;
  if (err) return <p className="statusline err">{err}</p>;

  return (
    <div className="stack g20">
      <div className="skybox">
        <canvas ref={canvas} className="skydust" />
        <svg viewBox="0 0 440 230" className="skysvg" role="img" aria-label="Your memories as stars">
          {stars.map((s, i) =>
            i > 0 ? (
              <line
                key={"l" + s.id}
                className="skylink"
                x1={stars[i - 1].x}
                y1={stars[i - 1].y}
                x2={s.x}
                y2={s.y}
              />
            ) : null
          )}
          {stars.map((s) => {
            const both = Boolean(s.perspectives?.sayak && s.perspectives?.debi);
            return (
              <g
                key={s.id}
                className={"skystar" + (sel?.id === s.id ? " sel" : "")}
                tabIndex={0}
                role="button"
                aria-label={s.title}
                onClick={() => setSel(sel?.id === s.id ? null : s)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSel(sel?.id === s.id ? null : s);
                  }
                }}
              >
                <circle className="halo" cx={s.x} cy={s.y} r={both ? 16 : 12} />
                <circle className="core" cx={s.x} cy={s.y} r={both ? 6 : 4.4} />
              </g>
            );
          })}
        </svg>

        {stars.length === 0 && (
          <p className="skyempty">
            An empty sky. Add a memory and the first star appears here.
          </p>
        )}
      </div>

      <p className="eyebrow center">
        {stars.length} {stars.length === 1 ? "star" : "stars"} · brighter ones are the memories
        you&apos;ve both written
      </p>

      {sel && (
        <div className="card stack g14">
          <p className="memdate">
            {new Date(sel.date + "T00:00:00").toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h3 className="memtitle">{sel.title}</h3>
          {sel.photo && (
            <div className="memphoto">
              <img src={sel.photo} alt={sel.title} loading="lazy" />
            </div>
          )}
          {["sayak", "debi"].map((p) =>
            sel.perspectives?.[p] ? (
              <div className="persp" key={p}>
                <p className="perspwho">How {p === "sayak" ? "Sayak" : "Debi"} remembers it</p>
                <p className="perspbody">{sel.perspectives[p]}</p>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
