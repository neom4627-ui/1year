"use client";

import { useEffect, useState } from "react";
import { apiGet, apiDelete } from "../../lib/api";

/* Where everything goes, and how to take it back.

   Stated plainly rather than buried: she should know the destination
   before she records anything, and a delete button here really removes
   the file from Drive, not just the row on screen.
*/
export default function Privacy() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = async () => {
    try {
      const d = await apiGet("/api/submissions");
      setItems(d.items);
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

  const remove = async (id) => {
    setBusy(id);
    try {
      await apiDelete("/api/submissions", { id });
      setConfirm(null);
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="stack g28">
      <div className="card stack g14">
        <p className="eyebrow">where things go</p>
        <ul className="plainlist">
          <li>
            <strong>What you write here</strong> is stored on this site&apos;s own database and
            emailed to Sayak.
          </li>
          <li>
            <strong>Videos and voice notes</strong> are uploaded to a private folder in
            Sayak&apos;s Google Drive. Nobody else has a link to it.
          </li>
          <li>
            <strong>Photos</strong> you attach to memories are stored by this site so they can
            be shown on the page.
          </li>
          <li>
            Nothing is uploaded until you press a send button. You can read every page here
            without writing or recording anything at all.
          </li>
          <li>
            The site is unlisted and blocked from search engines, but anyone with the link and
            the passcode can open it. Treat it as private, not secret.
          </li>
        </ul>
      </div>

      <div className="stack g14">
        <p className="eyebrow">things you&apos;ve sent</p>
        {loading && <p className="statusline">Checking…</p>}
        {err && <p className="statusline err">{err}</p>}
        {!loading && items.length === 0 && (
          <p className="body">Nothing yet. When you send something it&apos;ll be listed here.</p>
        )}

        <ul className="plainlist">
          {items.map((s) => (
            <li className="subrow" key={s.id}>
              <div>
                <span className="blabel">
                  {s.kind === "video" ? "🎥 Video" : s.kind === "audio" ? "🎙 Voice note" : "✉ Letter"}
                </span>
                <span className="finehint">
                  {new Date(s.at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                  {s.preview ? ` · ${s.preview}` : ""}
                </span>
              </div>

              {confirm === s.id ? (
                <div className="row">
                  <button
                    className="btn tiny"
                    type="button"
                    onClick={() => remove(s.id)}
                    disabled={busy === s.id}
                  >
                    {busy === s.id ? "Deleting…" : "Really delete"}
                  </button>
                  <button className="btn tiny ghost" type="button" onClick={() => setConfirm(null)}>
                    Keep
                  </button>
                </div>
              ) : (
                <button className="btn tiny ghost" type="button" onClick={() => setConfirm(s.id)}>
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>

        <p className="finehint">
          Deleting removes the actual file from Drive, not just this row.
        </p>
      </div>
    </div>
  );
}
