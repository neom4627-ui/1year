"use client";

import { useEffect, useState } from "react";
import { apiGet, apiSend, apiDelete } from "../../lib/api";
import { DISPLAY, otherOf } from "../../lib/identity";
import { burst } from "../../lib/fx";

/* How well do we know each other.

   Both answer blind. Nobody's answers reach the other browser until both
   are in — otherwise the first person to submit has nothing at stake.
   Deliberately not scored: a number would turn a nice evening into a
   grievance.
*/
export default function Quiz() {
  const [state, setState] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const d = await apiGet("/api/quiz", { round: "2026" });
      setState(d);
      if (d.mine?.answers) setAnswers(d.mine.answers);
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

  const submit = async () => {
    setSaving(true);
    try {
      const d = await apiSend("/api/quiz", "POST", { round: "2026", answers });
      if (d.bothIn) burst(140);
      else burst(30);
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const redo = async () => {
    await apiDelete("/api/quiz", { round: "2026" });
    setAnswers({});
    load();
  };

  if (loading) return <p className="statusline">Loading the questions…</p>;
  if (err) return <p className="statusline err">{err}</p>;

  const { who, questions, mine, theirs, theySubmitted, bothIn } = state;
  const them = otherOf(who);

  /* Both in — show them side by side. */
  if (bothIn) {
    return (
      <div className="stack g20">
        <p className="body center mx">
          Both in. No scores, no winner — just the two of you, answering blind.
        </p>
        {questions.map((q) => (
          <div className="card stack g14" key={q.id}>
            <p className="qask">{q.ask}</p>
            <div className="persps">
              <div className="persp mine">
                <p className="perspwho">{DISPLAY[who]} said</p>
                <p className="perspbody">{mine.answers[q.id] || "— left blank —"}</p>
              </div>
              <div className="persp">
                <p className="perspwho">{DISPLAY[them]} said</p>
                <p className="perspbody">{theirs.answers[q.id] || "— left blank —"}</p>
              </div>
            </div>
          </div>
        ))}
        <div className="row c">
          <button className="btn ghost" type="button" onClick={redo}>
            Redo my answers
          </button>
        </div>
      </div>
    );
  }

  /* Submitted, waiting on the other person. */
  if (mine) {
    return (
      <div className="card stack g20 center">
        <p className="sent">Locked in. ♥</p>
        <p className="body mx center">
          Your answers are sealed until {DISPLAY[them]} has answered too. Nothing is shown to
          either of you before then.
        </p>
        <p className="eyebrow">
          {theySubmitted ? "they've answered — refresh" : `waiting on ${DISPLAY[them]}`}
        </p>
        <div className="row c">
          <button className="btn ghost" type="button" onClick={redo}>
            Change my answers
          </button>
          <button className="btn" type="button" onClick={load}>
            Check again
          </button>
        </div>
      </div>
    );
  }

  /* Not yet submitted. */
  return (
    <div className="stack g20">
      <p className="body center mx">
        Answer honestly, not cleverly. {DISPLAY[them]}
        {theySubmitted ? " has already answered." : " hasn't answered yet."}
      </p>
      {questions.map((q) => (
        <div className="stack g8" key={q.id}>
          <label className="qask" htmlFor={"q-" + q.id}>
            {q.ask}
          </label>
          <textarea
            id={"q-" + q.id}
            className="minibox"
            rows={2}
            value={answers[q.id] || ""}
            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
          />
        </div>
      ))}
      <div className="row c">
        <button
          className="btn solid"
          type="button"
          onClick={submit}
          disabled={saving || !Object.values(answers).some((a) => a?.trim())}
        >
          {saving ? "Locking in…" : "Lock in my answers"}
        </button>
      </div>
    </div>
  );
}
