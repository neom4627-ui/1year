"use client";

import { useState, useRef } from "react";
import { STORY } from "../story";
import { burst } from "../../lib/fx";

function Figure({ who }) {
  const body = who === "s" ? "#9fc7f0" : "#ffb7cf";
  const hair = who === "s" ? "#3f3246" : "#4a2f3c";
  return (
    <svg viewBox="0 0 80 108" aria-hidden="true">
      <ellipse cx="40" cy="101" rx="20" ry="4" fill="rgba(76,43,78,.13)" />
      <path d="M26 56 q14 -7 28 0 l4 34 q-18 7 -36 0 z" fill={body} />
      <circle cx="40" cy="36" r="21" fill="#ffe3cf" />
      <path
        d="M19 33 q5 -22 21 -22 q16 0 21 22 q-6 -11 -21 -11 q-15 0 -21 11 z"
        fill={hair}
      />
      {who === "d" && (
        <>
          <circle cx="40" cy="17" r="4.4" fill="#ffd978" />
          <circle cx="40" cy="17" r="1.8" fill="#fff" />
        </>
      )}
      <circle cx="32" cy="37" r="2.5" fill="#3b2a33" />
      <circle cx="48" cy="37" r="2.5" fill="#3b2a33" />
      <circle cx="26" cy="43" r="3.4" fill="#ff9fb8" opacity=".5" />
      <circle cx="54" cy="43" r="3.4" fill="#ff9fb8" opacity=".5" />
      <path
        d="M35 44 q5 4 10 0"
        stroke="#3b2a33"
        strokeWidth="1.7"
        fill="none"
        strokeLinecap="round"
      />
      {/* arms reach toward each other so they appear to hold hands */}
      {who === "s" ? (
        <path
          d="M56 66 q18 6 22 18"
          stroke={body}
          strokeWidth="6.5"
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M24 66 q-18 6 -22 18"
          stroke={body}
          strokeWidth="6.5"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

const SECRET =
  "I still remember the exact feeling of realizing I never wanted to lose you — long before we had a date to celebrate.";

export default function Characters({ showTag = true }) {
  const [poke, setPoke] = useState("");
  const [on, setOn] = useState(false);
  const [secret, setSecret] = useState(false);
  const holdTimer = useRef(null);
  const holdFired = useRef(false);

  const tap = () => {
    if (holdFired.current) {
      holdFired.current = false;
      return;
    }
    setOn(false);
    setSecret(false);
    burst(12);
    setTimeout(() => {
      setPoke(STORY.pokes[(Math.random() * STORY.pokes.length) | 0]);
      setOn(true);
    }, 140);
  };

  const startHold = () => {
    holdFired.current = false;
    holdTimer.current = setTimeout(() => {
      holdFired.current = true;
      setSecret(true);
      setOn(true);
      setPoke(SECRET);
      burst(28);
    }, 720);
  };

  const endHold = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
  };

  return (
    <div className="stack g8">
      <div className="pair">
        <button
          className="chr s"
          type="button"
          onClick={tap}
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          onPointerCancel={endHold}
          aria-label="Tap or hold Sayak"
        >
          <Figure who="s" />
        </button>

        <span className="between-heart" aria-hidden="true">
          ♥
        </span>

        <button
          className="chr d"
          type="button"
          onClick={tap}
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          onPointerCancel={endHold}
          aria-label="Tap or hold Debi"
        >
          <Figure who="d" />
        </button>
      </div>
      {showTag && (
        <p className="nametag">
          sayak &nbsp;·&nbsp; debi &nbsp;— tap us
          <span className="hold-hint"> · hold for a secret</span>
        </p>
      )}
      <p className={"poke" + (on ? " on" : "") + (secret ? " secret" : "")}>
        {poke || "\u00a0"}
      </p>
    </div>
  );
}

