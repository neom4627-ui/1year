"use client";

import { useState } from "react";
import { STORY } from "../story";
import { apiSend } from "../../lib/api";
import { burst } from "../../lib/fx";
import Recorder, { uploadToDrive } from "./Recorder";

/* Short voice notes. A twenty-second clip keeps a laugh and a tone that
   a written paragraph throws away. */
export default function AudioDiary() {
  const [blob, setBlob] = useState(null);
  const [prompt] = useState(
    () => STORY.audioPrompts[(Math.random() * STORY.audioPrompts.length) | 0]
  );
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const send = async () => {
    if (!blob) return;
    setSending(true);
    setErr("");
    try {
      const { id, name } = await uploadToDrive(blob, "audio", setProgress);
      await apiSend("/api/submissions", "POST", {
        kind: "audio",
        driveId: id,
        name,
        preview: prompt,
      }).catch(() => {});
      setDone(true);
      burst(120);
    } catch (e) {
      setErr(e.message || "It didn't go through.");
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="card stack g14 center">
        <p className="sent">Saved. ♥</p>
        <p className="body mx center">
          It&apos;s in the Drive folder. You can take it back any time from Settings.
        </p>
        <div className="row c">
          <button
            className="btn ghost"
            type="button"
            onClick={() => {
              setDone(false);
              setBlob(null);
              setProgress(0);
            }}
          >
            Record another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="stack g20">
      <div className="card stack g8">
        <p className="eyebrow">today&apos;s prompt</p>
        <p className="hand">{prompt}</p>
        <p className="finehint">Ignore it and say whatever you like.</p>
      </div>

      <Recorder
        kind="audio"
        maxSeconds={180}
        disabled={sending}
        onReady={(b) => setBlob(b)}
        onCleared={() => setBlob(null)}
      />

      {sending && progress > 0 && (
        <div className="progress">
          <span style={{ width: progress + "%" }} />
        </div>
      )}
      {err && <p className="statusline err">{err}</p>}

      {blob && (
        <div className="row c">
          <button className="btn solid" type="button" onClick={send} disabled={sending}>
            {sending ? "Saving…" : "Save this voice note"}
          </button>
        </div>
      )}
    </div>
  );
}
