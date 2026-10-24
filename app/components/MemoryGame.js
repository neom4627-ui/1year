"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { STORY } from "../story";
import { burst } from "../../lib/fx";

function shuffled() {
  const deck = [];
  STORY.game.forEach((g, i) => {
    deck.push({ id: i, icon: g.icon, note: g.note });
    deck.push({ id: i, icon: g.icon, note: g.note });
  });
  for (let i = deck.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const t = deck[i];
    deck[i] = deck[j];
    deck[j] = t;
  }
  return deck;
}

export default function MemoryGame() {
  const [deck, setDeck] = useState([]);
  const [up, setUp] = useState([]);
  const [done, setDone] = useState([]);
  const [found, setFound] = useState([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const locked = useRef(false);
  const timer = useRef(null);

  const reset = useCallback(() => {
    clearTimeout(timer.current);
    locked.current = false;
    setDeck(shuffled());
    setUp([]);
    setDone([]);
    setFound([]);
    setMoves(0);
    setWon(false);
  }, []);

  useEffect(() => {
    reset();
    return () => clearTimeout(timer.current);
  }, [reset]);

  const flip = (k) => {
    if (locked.current || up.includes(k) || done.includes(k)) return;
    const next = [...up, k];
    setUp(next);
    if (next.length < 2) return;

    setMoves((m) => m + 1);
    const [a, b] = next;

    if (deck[a].id === deck[b].id) {
      const nd = [...done, a, b];
      setDone(nd);
      setUp([]);
      setFound((f) => [...f, deck[a]]);
      burst(22);
      if (nd.length === deck.length) {
        timer.current = setTimeout(() => {
          setWon(true);
          burst(130);
        }, 420);
      }
    } else {
      locked.current = true;
      timer.current = setTimeout(() => {
        setUp([]);
        locked.current = false;
      }, 820);
    }
  };

  return (
    <>
      <div className="gamebar rv on">
        <span>
          moves <b>{moves}</b>
        </span>
        <span>
          found <b>{found.length}</b>/{STORY.game.length}
        </span>
      </div>

      <div className="board">
        {deck.map((c, k) => {
          const isUp = up.includes(k) || done.includes(k);
          return (
            <button
              key={k}
              type="button"
              className="mcard"
              data-up={isUp ? "1" : "0"}
              data-done={done.includes(k) ? "1" : "0"}
              onClick={() => flip(k)}
              aria-label={`Card ${k + 1}`}
            >
              <div className="min">
                <div className="mface down">♥</div>
                <div className="mface up">{c.icon}</div>
              </div>
            </button>
          );
        })}
      </div>

      <ul className="found">
        {found.map((f, i) => (
          <li key={i}>
            {f.icon}&nbsp;&nbsp;{f.note}
          </li>
        ))}
      </ul>

      <p className="hand center" style={{ minHeight: "2em" }}>
        {won ? STORY.winMessage : " "}
      </p>

      <div className="row c">
        <button className="btn" type="button" onClick={reset}>
          Shuffle again
        </button>
      </div>
    </>
  );
}
