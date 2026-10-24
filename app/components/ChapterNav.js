"use client";

/* The old nav was a row of identical dots. This one is a reading ribbon:
   a filling progress line, the name of where she is, and markers she can
   jump to. It tells her how much of the story is left, which is the one
   thing dots never did. */

export const CHAPTERS = [
  "One year of us",
  "Before we became us",
  "The little things",
  "The museum",
  "My favourite chapters",
  "The difficult days",
  "Things to remember",
  "My promises",
  "All the tomorrows",
  "Find us",
  "The letter",
  "Backstage",
  "If I could begin again",
  "Your page",
];

export default function ChapterNav({ cur, count, onGo }) {
  const first = 1;
  const last = count - 1;
  const pct = ((cur - first) / Math.max(1, last - first)) * 100;

  return (
    <nav className="nav" aria-label="Story navigation">
      <div className="navinner">
        <div className="navtop">
          <span className="navchapter">
            <b>{String(cur).padStart(2, "0")}</b>
            <i>/</i>
            <span>{CHAPTERS[cur - 1] || ""}</span>
          </span>
        </div>

        <div className="ribbon" role="presentation">
          <span className="ribbon-fill" style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
          <span className="ribbon-glint" style={{ left: `${Math.max(0, Math.min(100, pct))}%` }} />
          {CHAPTERS.map((name, k) => {
            const i = k + 1;
            return (
              <button
                key={i}
                type="button"
                className="mark"
                style={{ left: `${(k / (CHAPTERS.length - 1)) * 100}%` }}
                aria-current={cur === i}
                aria-label={`${i}. ${name}`}
                title={name}
                onClick={() => onGo(i)}
              >
                <span />
              </button>
            );
          })}
        </div>

        <div className="navrow">
          <button
            className="navbtn"
            type="button"
            onClick={() => onGo(cur - 1)}
            disabled={cur <= first}
          >
            ← Back
          </button>
          <button
            className="navbtn next"
            type="button"
            onClick={() => onGo(cur + 1)}
            disabled={cur >= last}
          >
            {cur >= last ? "·" : "Next →"}
          </button>
        </div>
      </div>
    </nav>
  );
}
