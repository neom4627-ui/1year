"use client";

import { useEffect, useState } from "react";
import { STORY } from "../story";
import { apiGet, apiSend, apiDelete } from "../../lib/api";
import { DISPLAY } from "../../lib/identity";
import { burst } from "../../lib/fx";

/* Letters to your future selves.

   A sealed letter written by the other person arrives here with its body
   stripped out by the server — the page literally cannot show it early,
   which is the only way a seal means anything.
*/

function daysUntil(d) {
  return Math.ceil((new Date(d + "T00:00:00+05:30") - Date.now()) / 864e5);
}

export default function FutureLetters() {
  const [items, setItems] = useState([]);
  const [who, setWho] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [writing, setWriting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openId, setOpenId] = useState(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [revealOn, setRevealOn] = useState(STORY.defaultRevealDate);

  const load = async () => {
    try {
      const d = await apiGet("/api/letters");
      setItems(d.items);
      setWho(d.who);
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

  const save = async () => {
    if (!body.trim()) return;
    setSaving(true);
    try {
      await apiSend("/api/letters", "POST", { title, body, revealOn });
      setTitle("");
      setBody("");
      setWriting(false);
      burst(40);
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="statusline">Checking the seals…</p>;

  return (
    <div className="stack g28">
      {err && <p className="statusline err">{err}</p>}

      {!writing ? (
        <div className="row c">
          <button className="btn solid" type="button" onClick={() => setWriting(true)}>
            + Write to our future selves
          </button>
        </div>
      ) : (
        <div className="card stack g14">
          <p className="eyebrow">What do you hope we&apos;ll remember about who we were today?</p>
          <input
            className="field"
            placeholder="Give it a name (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
          />
          <textarea
            className="minibox tall"
            rows={10}
            placeholder="Dear us…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <label className="fieldlabel" htmlFor="reveal">
            Sealed until
          </label>
          <input
            id="reveal"
            className="field"
            type="date"
            value={revealOn}
            min={new Date(Date.now() + 864e5).toISOString().slice(0, 10)}
            onChange={(e) => setRevealOn(e.target.value)}
          />
          <p className="finehint">
            Once it&apos;s sealed, neither of you can read it here until that date — not even
            by poking at the page. You can still read your own.
          </p>
          <div className="row">
            <button className="btn solid" type="button" onClick={save} disabled={saving || !body.trim()}>
              {saving ? "Sealing…" : "Seal it"}
            </button>
            <button className="btn ghost" type="button" onClick={() => setWriting(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {items.length === 0 && !writing && (
        <p className="body center mx">
          No letters yet. The first one is worth writing today, while today still feels
          ordinary.
        </p>
      )}

      <div className="stack g14">
        {items.map((l) => {
          const mine = l.author === who;
          const d = daysUntil(l.revealOn);
          const locked = l.sealed && !mine;
          const isOpen = openId === l.id;

          return (
            <div className={"sealed" + (locked ? " locked" : "")} key={l.id}>
              <div className="sealedhead">
                <div>
                  <p className="eyebrow">
                    {mine ? "yours" : `from ${DISPLAY[l.author]}`}
                    {l.sealed ? " · sealed" : " · open"}
                  </p>
                  <h3 className="memtitle">{l.title || "Untitled letter"}</h3>
                  <p className="finehint">
                    {d > 0
                      ? `opens in ${d} ${d === 1 ? "day" : "days"} · ${l.revealOn}`
                      : `opened ${l.revealOn}`}
                  </p>
                </div>
                {mine && (
                  <button
                    className="xbtn"
                    type="button"
                    aria-label="Delete this letter"
                    onClick={async () => {
                      await apiDelete("/api/letters", { id: l.id });
                      load();
                    }}
                  >
                    ×
                  </button>
                )}
              </div>

              {locked ? (
                <p className="lockedbody">
                  🔒 {l.wordCount ? `${l.wordCount} words` : "Something"} waiting for you.
                  Not yet.
                </p>
              ) : (
                <>
                  <button
                    className="btn tiny ghost"
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : l.id)}
                  >
                    {isOpen ? "Close" : l.sealed ? "Read mine" : "Read it"}
                  </button>
                  {isOpen && <p className="lettertext">{l.body}</p>}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
