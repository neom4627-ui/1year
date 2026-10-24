"use client";

import { useEffect, useState } from "react";
import { apiGet, apiSend } from "../../lib/api";
import { DISPLAY, otherOf } from "../../lib/identity";
import { burst } from "../../lib/fx";

/* The anniversary time capsule.

   Three questions each, answered today, sealed until next year. Unlike
   the quiz this is one-shot on purpose — the value is in the answer you
   gave before you knew how the year turned out.
*/
export default function Capsule() {
  const [state, setState] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [confirming, setConfirming] = useState(false);

  const load = async () => {
    try {
      const d = await apiGet("/api/capsule", { year: "2026" });
      setState(d);
      setErr("");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const seal = async () => {
    setSaving(true);
    try {
      await apiSend("/api/capsule", "POST", { year: "2026", answers });
      burst(150);
      setConfirming(false);
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="statusline">Finding the capsule…</p>;
  if (err && !state) return <p className="statusline err">{err}</p>;

  const { who, questions, mine, theirs, theySubmitted, open, opensOn } = state;
  const them = otherOf(who);
  const days = Math.ceil((new Date(opensOn + "T00:00:00+05:30") - Date.now()) / 864e5);

  if (open) {
    return (
      <div className="stack g20">
        <p className="eyebrow center">opened {opensOn}</p>
        {questions.map((q) => (
          <div className="card stack g14" key={q.id}>
            <p className="qask">{q.ask}</p>
            <div className="persps">
              <div className="persp mine">
                <p className="perspwho">{DISPLAY[who]}, a year ago</p>
                <p className="perspbody">{mine?.answers?.[q.id] || "— nothing —"}</p>
              </div>
              <div className="persp">
                <p className="perspwho">{DISPLAY[them]}, a year ago</p>
                <p className="perspbody">{theirs?.answers?.[q.id] || "— nothing —"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (mine) {
    return (
      <div className="card stack g20 center">
        <p className="sent">Sealed. 🕰</p>
        <p className="body mx center">
          Your answers are locked until <strong>{opensOn}</strong> — {days} days away. Neither
          of you can read them before then, and they can&apos;t be edited. That&apos;s the
          point.
        </p>
        <p className="eyebrow">
          {theySubmitted ? `${DISPLAY[them]} has sealed theirs too` : `waiting on ${DISPLAY[them]}`}
        </p>
      </div>
    );
  }

  return (
    <div className="stack g20">
      <p className="body center mx">
        Answer these today. They get sealed until <strong>{opensOn}</strong> — one year from
        now. You only get one go, and you can&apos;t edit it afterwards.
      </p>

      {questions.map((q) => (
        <div className="stack g8" key={q.id}>
          <label className="qask" htmlFor={"c-" + q.id}>
            {q.ask}
          </label>
          <textarea
            id={"c-" + q.id}
            className="minibox"
            rows={4}
            value={answers[q.id] || ""}
            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
          />
        </div>
      ))}

      {err && <p className="statusline err">{err}</p>}

      {!confirming ? (
        <div className="row c">
          <button
            className="btn solid"
            type="button"
            onClick={() => setConfirming(true)}
            disabled={!Object.values(answers).some((a) => a?.trim())}
          >
            Seal it for a year
          </button>
        </div>
      ) : (
        <div className="card stack g14 center">
          <p className="body mx center">
            Once sealed you can&apos;t change a word until {opensOn}. Ready?
          </p>
          <div className="row c">
            <button className="btn solid" type="button" onClick={seal} disabled={saving}>
              {saving ? "Sealing…" : "Yes, seal it"}
            </button>
            <button className="btn ghost" type="button" onClick={() => setConfirming(false)}>
              Not yet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
