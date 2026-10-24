"use client";

import { useEffect, useState } from "react";
import { apiGet, apiSend, apiDelete, uploadPhoto } from "../../lib/api";
import { DISPLAY } from "../../lib/identity";
import { burst } from "../../lib/fx";

/* The small things you both want to do.

   Deliberately biased toward small: the placeholder asks for an ordinary
   afternoon, not a trip to Iceland. A list of unaffordable things is a
   list you stop opening.
*/
export default function BucketList() {
  const [items, setItems] = useState([]);
  const [who, setWho] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(null);

  const load = async () => {
    try {
      const d = await apiGet("/api/bucket");
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

  const add = async () => {
    if (!text.trim()) return;
    try {
      await apiSend("/api/bucket", "POST", { text });
      setText("");
      await load();
    } catch (e) {
      setErr(e.message);
    }
  };

  const toggle = async (item) => {
    setBusy(item.id);
    try {
      await apiSend("/api/bucket", "PATCH", { id: item.id, done: !item.done });
      if (!item.done) burst(40);
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(null);
    }
  };

  const attach = async (item, file) => {
    if (!file) return;
    setBusy(item.id);
    try {
      const url = await uploadPhoto(file);
      await apiSend("/api/bucket", "PATCH", { id: item.id, photo: url });
      await load();
    } catch (e) {
      setErr("Photo didn't upload: " + e.message);
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <p className="statusline">Loading the list…</p>;

  const open = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done);

  return (
    <div className="stack g28">
      {err && <p className="statusline err">{err}</p>}

      <div className="addrow">
        <input
          className="field"
          placeholder="an ordinary afternoon we should have…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          maxLength={200}
        />
        <button className="btn solid" type="button" onClick={add} disabled={!text.trim()}>
          Add
        </button>
      </div>

      {items.length === 0 && (
        <p className="body center mx">
          Nothing on the list yet. Start small — a food, a film, a walk with no plan.
        </p>
      )}

      <ul className="bucket">
        {open.map((i) => (
          <li key={i.id}>
            <button
              className="tickbox"
              type="button"
              onClick={() => toggle(i)}
              disabled={busy === i.id}
              aria-label={`Mark "${i.text}" as done`}
            />
            <div className="bucketbody">
              <span className="blabel">{i.text}</span>
              <span className="finehint">added by {DISPLAY[i.addedBy]}</span>
            </div>
            <button
              className="xbtn"
              type="button"
              onClick={() => apiDelete("/api/bucket", { id: i.id }).then(load)}
              aria-label="Remove"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {done.length > 0 && (
        <div className="stack g14">
          <p className="eyebrow">done · {done.length}</p>
          <ul className="bucket">
            {done.map((i) => (
              <li className="isdone" key={i.id}>
                <button
                  className="tickbox on"
                  type="button"
                  onClick={() => toggle(i)}
                  disabled={busy === i.id}
                  aria-label={`Mark "${i.text}" as not done`}
                >
                  ✓
                </button>
                <div className="bucketbody">
                  <span className="blabel">{i.text}</span>
                  <span className="finehint">
                    {i.doneOn} {i.doneBy ? `· ticked by ${DISPLAY[i.doneBy]}` : ""}
                  </span>
                  {i.photo && (
                    <div className="bucketphoto">
                      <img src={i.photo} alt={i.text} loading="lazy" />
                    </div>
                  )}
                </div>
                {!i.photo && (
                  <label className="btn tiny ghost">
                    {busy === i.id ? "…" : "Photo"}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => attach(i, e.target.files?.[0])}
                    />
                  </label>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
