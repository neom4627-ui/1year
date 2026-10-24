"use client";

import { useRef, useState } from "react";
import { STORY } from "../story";

/* If STORY.song is set, plays that file. Otherwise synthesises a slow
   four-note chord with the Web Audio API so there is always something. */
export default function Music() {
  const [playing, setPlaying] = useState(false);
  const [label, setLabel] = useState("music off");
  const audio = useRef(null);
  const ctxRef = useRef(null);
  const nodes = useRef([]);

  const startPad = () => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = ctxRef.current || new AC();
      ctxRef.current = ctx;
      ctx.resume();
      const master = ctx.createGain();
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 4);
      master.connect(ctx.destination);
      [130.81, 196.0, 329.63, 493.88].forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        const l = ctx.createOscillator();
        const lg = ctx.createGain();
        o.type = i < 2 ? "sine" : "triangle";
        o.frequency.value = f;
        g.gain.value = i < 2 ? 0.5 : 0.2;
        l.frequency.value = 0.04 + i * 0.019;
        lg.gain.value = i < 2 ? 0.2 : 0.09;
        l.connect(lg);
        lg.connect(g.gain);
        o.connect(g);
        g.connect(master);
        o.start();
        l.start();
        nodes.current.push(o, l);
      });
      nodes.current.push(master);
      return true;
    } catch {
      setLabel("unavailable");
      return false;
    }
  };

  const stopPad = () => {
    try {
      const ctx = ctxRef.current;
      const m = nodes.current[nodes.current.length - 1];
      if (m && m.gain && ctx) m.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
      setTimeout(() => {
        nodes.current.forEach((n) => {
          try {
            n.stop && n.stop();
          } catch {}
        });
        nodes.current = [];
      }, 1400);
    } catch {}
  };

  const toggle = () => {
    if (!playing) {
      if (STORY.song) {
        if (!audio.current) {
          audio.current = new Audio(STORY.song);
          audio.current.loop = true;
        }
        audio.current.play().then(
          () => {
            setPlaying(true);
            setLabel("music on");
          },
          () => setLabel("unavailable")
        );
        return;
      }
      if (startPad()) {
        setPlaying(true);
        setLabel("music on");
      }
      return;
    }
    if (STORY.song && audio.current) audio.current.pause();
    else stopPad();
    setPlaying(false);
    setLabel("music off");
  };

  return (
    <button className="musicbtn" type="button" onClick={toggle} aria-pressed={playing}>
      ♪ {label}
    </button>
  );
}
