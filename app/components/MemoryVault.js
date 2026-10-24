"use client";

import { useEffect, useState } from "react";
import { apiGet, apiSend, apiDelete, uploadPhoto } from "../../lib/api";
import { DISPLAY } from "../../lib/identity";
import { burst } from "../../lib/fx";

/* The memory vault.

   One record per memory, with room for both of your versions of it.
   The "two perspectives" idea is the good one in here: the gap between
   how you each remember the same afternoon is the interesting part.
*/

function Perspective({ who, text, isMine, onSave, saving }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text || "");

  useEffect(() => setDraft(text || ""), [text]);

  if (editing) {
    return (
      <div className="persp mine">
        <p className="perspwho">How {DISPLAY[who]} remembers it</p>
        <textarea
          className="minibox"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="your side of it…"
          rows={4}
        />
        <div className="row">
          <button
            className="btn tiny"
            type="button"
            disabled={saving}
            onClick={async () => {
              await onSave(draft);
              setEditing(false);
            }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button className="btn tiny ghost" type="button" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={"persp" + (isMine ? " mine" : "")}>
      <p className="perspwho">How {DISPLAY[who]} remembers it</p>
      {text ? (
        <p className="perspbody">{text}</p>
      ) : (
        <p className="perspempty">
          {isMine ? "You haven't written your side yet." : "Nothing here yet."}
        </p>
      )}
      {isMine && (
        <button className="btn tiny ghost" type="button" onClick={() => setEditing(true)}>
          {text ? "Edit mine" : "Add my side"}
        </button>
      )}
    </div>
  );
}

export default function MemoryVault() {
  const [items, setItems] = useState([]);
  const [who, setWho] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const load = async () => {
    try {
      const d = await apiGet("/api/memories");
      setItems(d.items);
      setWho(d.who);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const pickPhoto = async (file) => {
    if (!file) return;
    setUploadingPhoto(true);
    try {
      setPhoto(await uploadPhoto(file));
    } catch (e) {
      setError("Photo didn't upload: " + e.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const add = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await apiSend("/api/memories", "POST", { title, date, note, photo });
      setTitle("");
      setNote("");
      setPhoto(null);
      setAdding(false);
      burst(30);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const saveSide = async (id, text) => {
    setSaving(true);
    try {
      await apiSend("/api/memories", "PATCH", { id, note: text });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await apiDelete("/api/memories", { id });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <p className="statusline">Opening the vault…</p>;

  return (
    <div className="stack g28">
      {error && <p className="statusline err">{error}</p>}

      {!adding ? (
        <div className="row c">
          <button className="btn solid" type="button" onClick={() => setAdding(true)}>
            + Add a memory
          </button>
        </div>
      ) : (
        <div className="card stack g14">
          <p className="eyebrow">A new memory</p>
          <input
            className="field"
            placeholder="What happened?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={140}
          />
          <label className="fieldlabel" htmlFor="mem-date">
            When was it?
          </label>
          <input
            id="mem-date"
            className="field"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <textarea
            className="minibox"
            rows={4}
            placeholder="Why it mattered…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <label className="btn tiny ghost" style={{ alignSelf: "flex-start" }}>
            {uploadingPhoto ? "Uploading…" : photo ? "Photo added ✓" : "Attach a photo"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => pickPhoto(e.target.files?.[0])}
            />
          </label>
          <div className="row">
            <button className="btn solid" type="button" onClick={add} disabled={saving || !title.trim()}>
              {saving ? "Saving…" : "Save it"}
            </button>
            <button className="btn ghost" type="button" onClick={() => setAdding(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {items.length === 0 && !adding && (
        <p className="body center mx">
          Nothing in here yet. The first one is always the hardest — pick any ordinary
          afternoon you both remember differently.
        </p>
      )}

      <div className="memlist">
        {items.map((m) => (
          <article className="memcard" key={m.id}>
            <header className="memhead">
              <div>
                <p className="memdate">
                  {new Date(m.date + "T00:00:00").toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <h3 className="memtitle">{m.title}</h3>
              </div>
              {m.createdBy === who && (
                <button
                  className="xbtn"
                  type="button"
                  onClick={() => remove(m.id)}
                  aria-label="Delete this memory"
                >
                  ×
                </button>
              )}
            </header>

            {m.photo && (
              <div className="memphoto">
                <img src={m.photo} alt={m.title} loading="lazy" />
              </div>
            )}

            <div className="persps">
              {["sayak", "debi"].map((p) => (
                <Perspective
                  key={p}
                  who={p}
                  text={m.perspectives?.[p]}
                  isMine={p === who}
                  saving={saving}
                  onSave={(t) => saveSide(m.id, t)}
                />
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
