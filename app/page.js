"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { STORY } from "./story";
import { burst, paint, DARK_PAGE } from "../lib/fx";
import Background from "./components/Background";
import Characters from "./components/Characters";
import MemoryGame from "./components/MemoryGame";
import Music from "./components/Music";
import Photo from "./components/Photo";
import HerLetter from "./components/HerLetter";
import Hub from "./components/Hub";
import HeartTrail from "./components/HeartTrail";
import ParticleHeart from "./components/ParticleHeart";
import Ornament from "./components/Ornament";
import ChapterNav from "./components/ChapterNav";
import { setPass } from "../lib/api";

const PAGE_COUNT = 15;

/* Staggers in anything with className "rv" inside this stage. The
   dissolve between pages is played by the wrapper in the pager below,
   so nothing here needs to know about it. */
function Stage({ children, wide }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const host = ref.current;
    if (!host) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = Array.from(host.querySelectorAll(".rv"));
    const timers = items.map((el, i) =>
      setTimeout(() => el.classList.add("on"), reduce ? 0 : 110 + i * 130)
    );
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <section className="stage" ref={ref}>
      <div className={"wrap" + (wide ? " wide" : "")}>{children}</div>
    </section>
  );
}

/* ───────────────────────── 0 · gate ───────────────────────── */
function Gate({ onOpen }) {
  const [value, setValue] = useState("");
  const [msg, setMsg] = useState("");
  const [shake, setShake] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const days = (() => {
    const d = Math.ceil(
      (new Date(STORY.anniversary + "T00:00:00+05:30") - new Date()) / 864e5
    );
    if (d > 0) return `${d} ${d === 1 ? "day to go" : "days to go"}`;
    if (d === 0) return "it's today ♥";
    return "";
  })();

  const submit = (e) => {
    e?.preventDefault();
    const v = value.trim().toLowerCase();
    if (v === STORY.passcode.toLowerCase() || v === "09") {
      setOpen(true);
      burst(140);
      // second, softer wave a beat later — feels like the universe opening
      setTimeout(() => burst(50), 320);
      setTimeout(() => onOpen(v), 920);
      return;
    }
    setMsg(v ? "Not quite. Think about what I call you." : "Go on, type it.");
    setShake(false);
    requestAnimationFrame(() => setShake(true));
  };

  return (
    <Stage>
      {/* Deliberately not a <form>. A real form submits natively if the
          button is pressed before React has hydrated — on a slow phone
          that reloads the page and dumps her back here looking like the
          passcode was wrong. */}
      <div
        className={"envelope stack g20" + (shake ? " shake" : "")}
        onAnimationEnd={() => setShake(false)}
      >
        <div className={"sealwrap" + (open ? " open" : "")}>
          <div className="flap">♥</div>
        </div>
        <div className="stack g8" style={{ alignItems: "center" }}>
          <p className="eyebrow">25 · 10 · 2025 &nbsp;—&nbsp; 25 · 10 · 2026</p>
          <h2 style={{ fontSize: "clamp(1.9rem,8vw,2.6rem)" }}>
            <span className="foil">One year of us</span>
          </h2>
          <Ornament variant="stars" />
        </div>
        <p className="body mx center" style={{ fontSize: ".96rem" }}>
          A little universe made from our memories, our silly moments, and all the love I
          sometimes struggle to put into words.
        </p>
        <p className="hand center">Made just for you. ♡</p>
        <div className="stack g14" style={{ alignItems: "center" }}>
          <label htmlFor="pass" className="eyebrow">
            type the name that belongs on every page
          </label>
          <input
            id="pass"
            ref={inputRef}
            className="passinput"
            type="text"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
            placeholder="· · · ·"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit(e)}
          />
          <button className="btn solid" type="button" onClick={submit}>
            Open our little universe
          </button>
          <p className="gatemsg" role="status">
            {msg || " "}
          </p>
        </div>
        {days && <p className="gate-days">{days}</p>}
      </div>
    </Stage>
  );
}

/* ───────────────────────── small pieces ───────────────────────── */
function Heading({ eyebrow, title, children }) {
  return (
    <div className="stack g8 rv">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

function StaggerList({ items }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const host = ref.current;
    if (!host) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lis = Array.from(host.children);
    const timers = lis.map((el, i) =>
      setTimeout(() => el.classList.add("on"), reduce ? 0 : 360 + i * 140)
    );
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <ul className="things" ref={ref}>
      {items.map((t, i) => (
        <li key={i}>
          <span className="bullet">♥</span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

function Museum() {
  const [open, setOpen] = useState(null);
  return (
    <div className="museum">
      {STORY.museum.map((m, i) => (
        <button
          key={i}
          type="button"
          className="exhibit rv on"
          aria-expanded={open === i}
          onClick={() => setOpen(open === i ? null : i)}
        >
          <div className="exnum">{m.n}</div>
          <div className="extitle">{m.t}</div>
          <div className="exopen">
            <div className="exstory">{m.story}</div>
            <div className="exphoto">
              <Photo src={m.photo} tilt={i % 2 ? 1 : -1.2} />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function Chapters() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const host = ref.current;
    if (!host) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const spine = setTimeout(() => host.classList.add("on"), reduce ? 0 : 280);
    const timers = Array.from(host.children).map((el, i) =>
      setTimeout(() => el.classList.add("on"), reduce ? 0 : 400 + i * 210)
    );
    return () => {
      clearTimeout(spine);
      timers.forEach(clearTimeout);
    };
  }, []);
  return (
    <div className="chapters" ref={ref}>
      {STORY.chapters.map((c, i) => (
        <div className="chapter rv" key={i}>
          <div className="cnum">{c.n}</div>
          <div className="ctitle">{c.t}</div>
          <div className="ctext">{c.x}</div>
          {c.photo && (
            <div style={{ marginTop: 14, maxWidth: 300 }}>
              <Photo src={c.photo} tilt={i % 2 ? 1.2 : -1} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function FlipCards() {
  const [flipped, setFlipped] = useState([]);
  const toggle = (i) =>
    setFlipped((f) => (f.includes(i) ? f.filter((x) => x !== i) : [...f, i]));
  return (
    <div className="rgrid">
      {STORY.remember.map((r, i) => (
        <button
          key={i}
          type="button"
          className="rcard rv on"
          aria-pressed={flipped.includes(i)}
          onClick={() => toggle(i)}
        >
          <div className="rin">
            <div className="rface front">{r.f}</div>
            <div className="rface back">{r.b}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

function Promises() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const host = ref.current;
    if (!host) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = Array.from(host.children).map((el, i) =>
      setTimeout(() => el.classList.add("on"), reduce ? 0 : 280 + i * 250)
    );
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <div className="promises" ref={ref}>
      {STORY.promises.map((p, i) => (
        <div className="promise" key={i}>
          <span className="tick">✓</span>
          <div>
            <div className="pt">{p.t}</div>
            <div className="pb">{p.b}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Someday() {
  const [done, setDone] = useState([]);
  const toggle = (i) => {
    setDone((d) => {
      if (d.includes(i)) return d.filter((x) => x !== i);
      burst(14);
      return [...d, i];
    });
  };
  return (
    <ul className="someday">
      {STORY.someday.map((s, i) => (
        <li key={i} data-done={done.includes(i) ? "1" : "0"} onClick={() => toggle(i)}>
          <span className="box">✓</span>
          <span className="lbl">{s}</span>
        </li>
      ))}
    </ul>
  );
}

function Paragraphs({ lines }) {
  const ref = useRef(null);
  const [all, setAll] = useState(false);
  useLayoutEffect(() => {
    const host = ref.current;
    if (!host) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = Array.from(host.children).map((el, i) =>
      setTimeout(() => el.classList.add("on"), reduce ? 0 : 460 + i * 900)
    );
    return () => timers.forEach(clearTimeout);
  }, []);
  useEffect(() => {
    if (all && ref.current) {
      Array.from(ref.current.children).forEach((el) => el.classList.add("on"));
    }
  }, [all]);
  return (
    <>
      <div className="letterpaper">
        <div className="stack g20" ref={ref}>
          {lines.map((p, i) => (
            <p className={"lpara" + (i === lines.length - 1 ? " sign" : "")} key={i}>
              {p}
            </p>
          ))}
        </div>
      </div>
      {!all && (
        <div className="row c">
          <button className="btn" type="button" onClick={() => setAll(true)}>
            Show all of it
          </button>
        </div>
      )}
    </>
  );
}

function Finale({ onRestart, onUniverse }) {
  const [line, setLine] = useState("Tap a star.");
  const [fade, setFade] = useState(1);
  const [revealed, setRevealed] = useState(false);
  const [eggHit, setEggHit] = useState(false);

  const tap = (who) => {
    setFade(0);
    burst(16);
    setTimeout(() => {
      setLine(who === "s" ? STORY.starLines.sayak : STORY.starLines.debi);
      setFade(1);
    }, 200);
  };

  const key = (e, who) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      tap(who);
    }
  };

  return (
    <Stage>
      <div className="stack g28 center">
        <p className="eyebrow rv">25 October 2026</p>
        <h1 className="rv">
          <span className="foil">
            If I could
            <br />
            begin again
          </span>
        </h1>

        <svg
          className="constellation rv"
          viewBox="0 0 440 190"
          role="img"
          aria-label="Two stars named Sayak and Debi, joined by a line"
        >
          {/* a scatter of lesser stars, so the two that matter have a sky
              to belong to rather than floating in empty space */}
          {[
            [38, 32, 1.1], [74, 148, 0.8], [168, 26, 1.4], [206, 62, 0.9],
            [252, 22, 1.1], [286, 158, 1.2], [352, 48, 0.9], [396, 120, 1.3],
            [142, 118, 0.8], [230, 140, 1], [410, 28, 0.8], [58, 96, 0.9],
          ].map(([x, y, r], i) => (
            <circle
              key={i}
              className="minstar"
              cx={x}
              cy={y}
              r={r}
              style={{ animationDelay: `${(i % 6) * 0.7}s` }}
            />
          ))}
          <line className="lnk drawn" x1="118" y1="78" x2="318" y2="104" />
          <g
            className="star"
            tabIndex={0}
            role="button"
            aria-label="Reveal Sayak's line"
            onClick={() => tap("s")}
            onKeyDown={(e) => key(e, "s")}
          >
            <circle className="glow" cx="118" cy="78" r="17" fill="#ffd98a" opacity=".4" />
            <circle className="core" cx="118" cy="78" r="5" fill="#fff6e0" />
            <text x="118" y="112" textAnchor="middle">
              Sayak
            </text>
          </g>
          <g
            className="star"
            tabIndex={0}
            role="button"
            aria-label="Reveal Debi's line"
            onClick={() => tap("d")}
            onKeyDown={(e) => key(e, "d")}
          >
            <circle className="glow" cx="318" cy="104" r="19" fill="#ffc7e0" opacity=".4" />
            <circle className="core" cx="318" cy="104" r="5.5" fill="#fff4f8" />
            <text x="318" y="140" textAnchor="middle">
              Debi
            </text>
          </g>
        </svg>

        <p className="starline" style={{ opacity: fade }}>
          {line}
        </p>

        {STORY.finalePhoto && (
          <div style={{ maxWidth: 320, marginInline: "auto" }} className="rv">
            <Photo src={STORY.finalePhoto} tilt={1.4} />
          </div>
        )}

        <div className="card stack g20 rv" style={{ textAlign: "left" }}>
          <p className="body">
            If I could go back to the beginning knowing everything I know now, I wouldn&apos;t
            ask for a perfect story. I&apos;d ask for the chance to meet you again. To have
            those first conversations. To watch a friendship become something more, one moment
            at a time.
          </p>
          <p className="body">
            Not a perfect year. <strong>Our first year.</strong> The one that belongs to us,
            with all its memories and lessons and laughter and everything we&apos;re still
            learning.
          </p>
        </div>

        <p className="lede rv">
          Different dreams, different roads,
          <br />
          one beautiful chapter at a time.
        </p>

        {!revealed ? (
          <div className="row c rv">
            <button
              className="btn solid"
              type="button"
              onClick={() => {
                setRevealed(true);
                burst(130);
              }}
            >
              One last thing
            </button>
          </div>
        ) : (
          <p className="revealbox on">{STORY.finalReveal}</p>
        )}

        <div className="stack g8" style={{ marginTop: 10 }}>
          <label htmlFor="egg" className="eyebrow" style={{ color: "var(--ink-soft)" }}>
            say the obvious thing here
          </label>
          <input
            id="egg"
            className="egg"
            type="text"
            autoComplete="off"
            spellCheck="false"
            placeholder={eggHit ? "♥ i love you too ♥" : "three words, no spaces"}
            onChange={(e) => {
              const v = e.target.value.toLowerCase().replace(/[^a-z]/g, "");
              if (v.includes("iloveyou")) {
                burst(190);
                setEggHit(true);
                e.target.value = "";
              }
            }}
          />
        </div>

        <div className="row c">
          <button className="btn solid" type="button" onClick={onUniverse}>
            Enter our universe →
          </button>
          <button className="btn ghost" type="button" onClick={onRestart}>
            Start our story again
          </button>
        </div>
      </div>
    </Stage>
  );
}

/* ───────────────────────── the app ───────────────────────── */
export default function Page() {
  const [cur, setCur] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [pass, setPassValue] = useState("");
  const [inHub, setInHub] = useState(false);
  const [phase, setPhase] = useState("in");
  const pending = useRef(null);

  useEffect(() => {
    if (inHub) return; // the hub paints its own theme per tab
    paint(cur);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [cur, inHub]);

  /* Remembers the passcode so she isn't re-typing it on every visit,
     and tells Sayak the first time she opens it. */
  const onUnlock = (v) => {
    setPassValue(v);
    setPass(v);
    setUnlocked(true);
    go(1);
    fetch("/api/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode: v }),
    }).catch(() => {});
  };

  useEffect(() => {
    const onKey = (e) => {
      if (!unlocked || inHub) return;
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight") go(cur + 1);
      if (e.key === "ArrowLeft") go(cur - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [unlocked, inHub, cur]);

  /* Pages dissolve: fade the current one out, swap, fade the next one in.
     The timeout is cleared on unmount so a fast tapper can't leave a page
     stuck mid-fade. */
  function go(i) {
    const next = Math.max(0, Math.min(i, PAGE_COUNT - 1));
    if (next === cur) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || cur === 0) {
      setCur(next);
      setPhase("in");
      return;
    }
    if (pending.current) clearTimeout(pending.current);
    setPhase("out");
    pending.current = setTimeout(() => {
      setCur(next);
      setPhase("in");
      pending.current = null;
    }, 300);
  }

  useEffect(() => () => pending.current && clearTimeout(pending.current), []);

  const pages = {
    0: <Gate key="g" onOpen={onUnlock} />,

    1: (
      <Stage key="1">
        <div className="stack g28 center">
          <p className="dateline rv">25 October 2025 — 25 October 2026</p>
          <h1 className="rv">
            <span className="shimmer">
              One year
              <br />
              of us
            </span>
          </h1>
          <p className="lede mx rv" style={{ maxWidth: "36ch" }}>
            To the girl who unknowingly became my home.
          </p>
          {STORY.heroPhoto && (
            <div className="rv" style={{ maxWidth: 320, marginInline: "auto" }}>
              <Photo src={STORY.heroPhoto} tilt={-1.6} />
            </div>
          )}
          <div className="rv">
            <Characters />
          </div>
          <div className="rv" style={{ marginTop: 2 }}>
            <ParticleHeart size={236} />
          </div>
          <div className="rv">
            <Ornament variant="flourish" />
          </div>
          <div className="card stack g14 rv" style={{ textAlign: "left" }}>
            <p className="body">
              One year. It feels strange to write that, because sometimes it feels like
              we&apos;ve known each other forever, and sometimes I still get that little jolt
              of finding out something new about you.
            </p>
            <p className="body">
              This isn&apos;t just a website. It&apos;s a piece of my heart you can open
              whenever you miss me, whenever you need a smile, whenever you want to remember
              us.
            </p>
          </div>
        </div>
      </Stage>
    ),

    2: (
      <Stage key="2">
        <div className="stack g28">
          <Heading eyebrow="Chapter one" title="Before we became us" />
          <div className="card stack g20 rv">
            <p className="body">
              Do you know what I find beautiful about our story? We didn&apos;t begin as two
              strangers trying to impress each other. We had a friendship before we had this
              love — a person I could already talk to, laugh with, and slowly come to know in
              ways I didn&apos;t fully understand at the time.
            </p>
            <p className="body">
              Somewhere between all our conversations and our silly moments, you became more
              than someone in my life. You became someone whose happiness mattered to me in a
              different way. Someone whose messages could change my day. Someone I started
              putting into my tomorrows.
            </p>
            <p className="body">
              And then, on 25 October 2025, we began our chapter as <em>us</em>.
            </p>
          </div>
          <p className="quote rv">
            Perhaps the best love stories don&apos;t begin with strangers meeting, but with
            friends discovering that home was closer than they thought.
          </p>
          <div className="rv">
            <Ornament variant="knot" />
          </div>
        </div>
      </Stage>
    ),

    3: (
      <Stage key="3">
        <div className="stack g28">
          <Heading eyebrow="The details only I notice" title="The little things" />
          <div className="card stack g20 rv">
            <p className="body">
              I don&apos;t think love lives only in anniversaries and gifts and grand
              declarations. I think it lives in the tiny things. In your expressions when
              you&apos;re irritated. In the conversations that run longer than we planned. In
              the moments when you&apos;re completely yourself and don&apos;t realise how
              precious that is to me.
            </p>
            <p className="body">
              You don&apos;t have to perform happiness for me. You can simply be Debi.
            </p>
          </div>
          <StaggerList items={STORY.littleThings} />
        </div>
      </Stage>
    ),

    4: (
      <Stage key="4">
        <div className="stack g28">
          <Heading eyebrow="A very important exhibition" title="The Sayak & Debi Museum">
            <p className="body">
              A collection of things that make absolutely no sense to anyone else. Tap an
              exhibit to open it.
            </p>
          </Heading>
          <Museum />
          <p
            className="placard rv"
            style={{
              fontFamily: "var(--display)",
              fontStyle: "italic",
              fontSize: ".95rem",
              color: "var(--ink-soft)",
              textAlign: "center",
              borderTop: "1px solid rgba(124,90,120,.2)",
              paddingTop: 16,
            }}
          >
            Entry is free. Leaving without smiling is prohibited.
            <br />
            Curator: Sayak. Most important exhibit: Debi.
          </p>
        </div>
      </Stage>
    ),

    5: (
      <Stage key="5">
        <div className="stack g28">
          <Heading eyebrow="Our favourite pages" title="My favourite chapters" />
          <p className="body rv">
            If our relationship were a book, I wouldn&apos;t want only the big days in it.
            I&apos;d want the random afternoons, the unexpected laughter, the ordinary moments
            that only became precious later.
          </p>
          <Chapters />
          <p className="hand center rv">And the best part? So many blank pages left.</p>
        </div>
      </Stage>
    ),

    6: (
      <Stage key="6">
        <div className="stack g28">
          <Heading eyebrow="Honesty, growth, forgiveness" title="Even on the difficult days" />
          <div className="card stack g20 rv">
            <p className="body">
              I wish I could promise you we&apos;ll never misunderstand each other. But I
              don&apos;t want to give you promises that sound beautiful and mean nothing when
              life gets hard.
            </p>
            <p className="body">
              We&apos;ve had moments when understanding each other wasn&apos;t easy. Moments
              when the emotion was bigger than the words we could find. Moments that taught me
              that loving someone and knowing how to love them well are not the same thing.
            </p>
            <p className="body">
              I&apos;m still learning. That listening matters more than explaining. That an
              apology should come with changed behaviour. That we can disagree without becoming
              enemies. That love should leave room for honesty, boundaries, and the freedom to
              be ourselves.
            </p>
          </div>
          <p className="quote rv">
            I don&apos;t want a love that never struggles. I want a love that keeps learning
            how to be kind.
          </p>
        </div>
      </Stage>
    ),

    7: (
      <Stage key="7" wide>
        <div className="stack g28">
          <Heading
            eyebrow="For the heavy days · tap each one"
            title="Things I want you to remember"
          />
          <p className="body rv">
            Especially on the days when your own mind makes everything feel heavier.
          </p>
          <FlipCards />
          <p className="hand center rv">
            You don&apos;t have to be happy every day to deserve being loved.
          </p>
        </div>
      </Stage>
    ),

    8: (
      <Stage key="8">
        <div className="stack g28">
          <Heading eyebrow="Only the ones I can keep" title="My promises to you" />
          <Promises />
          <p className="hand center rv" style={{ whiteSpace: "pre-line" }}>
            {STORY.corePromise}
          </p>
        </div>
      </Stage>
    ),

    9: (
      <Stage key="9">
        <div className="stack g28">
          <Heading eyebrow="No pressure, just directions" title="All the tomorrows" />
          <div className="card stack g20 rv">
            <p className="body">
              When I imagine our future I don&apos;t only imagine the grand things. I imagine
              sharing food after a long day. Sending each other photos of something stupid.
              Walking somewhere with no plan. Sitting together without needing to fill the
              silence.
            </p>
            <p className="body">
              I want us to have room for our own ambitions and friendships and discoveries —
              and to keep finding joy in growing alongside each other anyway.
            </p>
          </div>
          <div className="stack g14 rv">
            <p className="eyebrow">Our someday list · tick one off</p>
            <Someday />
          </div>
        </div>
      </Stage>
    ),

    10: (
      <Stage key="10">
        <div className="stack g28">
          <div className="stack g8 center rv">
            <p className="eyebrow">A little break</p>
            <h2>Find us</h2>
            <p className="body mx center" style={{ maxWidth: "38ch" }}>
              Six pairs. Every match is something that belongs to us.
            </p>
          </div>
          <MemoryGame />
        </div>
      </Stage>
    ),

    11: (
      <Stage key="11">
        <div className="stack g28">
          <Heading eyebrow="The heart of it" title="A letter I couldn't say aloud" />
          <div className="rv">
            <Ornament variant="flourish" />
          </div>
          <Paragraphs lines={STORY.letter} />
        </div>
      </Stage>
    ),

    12: (
      <Stage key="12">
        <div className="stack g28">
          <Heading eyebrow="Backstage" title="A message from the boy who made this" />
          <Paragraphs lines={STORY.maker} />
          <div className="rv">
            <Characters showTag={false} />
          </div>
        </div>
      </Stage>
    ),

    13: <Finale key="13" onRestart={() => go(1)} onUniverse={() => setInHub(true)} />,

    14: (
      <Stage key="14">
        <div className="stack g28">
          <Heading eyebrow="The only page that's yours" title={STORY.herTurn.title} />
          <p className="body rv">{STORY.herTurn.intro}</p>
          <HerLetter passcode={pass || STORY.passcode} />
          <div className="row c">
            <button className="btn ghost" type="button" onClick={() => setInHub(true)}>
              There&apos;s more → our universe
            </button>
          </div>
        </div>
      </Stage>
    ),
  };

  if (inHub) {
    return (
      <>
        <Background starry={false} />
        <HeartTrail />
        <Music />
        <main className="contentlayer">
          <Hub onBackToStory={() => setInHub(false)} />
        </main>
      </>
    );
  }

  return (
    <>
      <Background starry={cur === DARK_PAGE} />
      <HeartTrail />
      {unlocked && <Music />}

      <main className="contentlayer">
        <div key={cur} className={phase === "out" ? "turn-out" : "turn-in"}>
          {pages[cur]}
        </div>
      </main>

      {unlocked && <ChapterNav cur={cur} count={PAGE_COUNT} onGo={go} />}
    </>
  );
}
