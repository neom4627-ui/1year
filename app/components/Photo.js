"use client";

import { useRef, useState } from "react";

/**
 * Polaroid with light 3D perspective that follows the pointer.
 * Falls back gracefully when src is null.
 */
export default function Photo({ src, caption, tilt = -1 }) {
  const ref = useRef(null);
  const [rx, setRx] = useState(0);
  const [ry, setRy] = useState(0);
  const [hover, setHover] = useState(false);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setRy((px - 0.5) * 14);
    setRx((0.5 - py) * 10);
  };

  const onLeave = () => {
    setHover(false);
    setRx(0);
    setRy(0);
  };

  return (
    <div className="photo3d-wrap" style={{ perspective: "900px" }}>
      <div
        ref={ref}
        className={"photoframe photo3d" + (hover ? " live" : "")}
        style={{
          transform: hover
            ? `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${tilt * 0.3}deg) translateZ(12px)`
            : `rotate(${tilt}deg)`,
        }}
        onPointerEnter={() => setHover(true)}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        <div className="inner">
          {src ? (
            <img src={src} alt={caption || ""} loading="lazy" />
          ) : (
            <span className="emptyframe">photo goes here</span>
          )}
        </div>
        {caption ? <div className="cap">{caption}</div> : null}
        <div className="photo3d-glare" aria-hidden="true" />
      </div>
    </div>
  );
}
