"use client";

import { useEffect, useRef, useState } from "react";
import { STORY } from "../story";
import { burst } from "../../lib/fx";
import { apiSend } from "../../lib/api";
import Recorder, { uploadToDrive } from "./Recorder";

/* Her letter back, and optionally a video.

   Nothing uploads without her pressing Send. Where it goes is stated
   before she records, not after, and she can take it back afterwards
   from Settings in the hub.
*/
export default function HerLetter({ passcode }) {
  const [text, setText] = useState("");
  const [blob, setBlob] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [kind, setKind] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const draftKey = useRef("debi-draft");

  /* Keeps an unsent draft so a dropped connection doesn't eat her words. */
  useEffect(() => {
    try {
      const d = localStorage.getItem(draftKey.current);
      if (d) setText(d);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      if (text) localStorage.setItem(draftKey.current, text);
    } catch {}
  }, [text]);

  const say = (m, k = "") => {
    setStatus(m);
    setKind(k);
  };

  const send = async () => {
    if (!text.trim() && !blob) {
      say("Write something, or record something. Either is enough.", "err");
      return;
    }
    setSending(true);
    setProgress(0);
    try {
      let videoLink = null;
      let driveId = null;

      if (blob) {
        say("Sending your video…");
        const out = await uploadToDrive(blob, "video", setProgress);
        driveId = out.id;
        videoLink = out.id ? `https://drive.google.com/file/d/${out.id}/view` : "uploaded to Drive";
      }

      say("Sending…");
      const r = await fetch("/api/letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode, text: text.trim(), videoLink }),
      });
      if (!r.ok) throw new Error((await r.text()) || "send failed");

      // Record it so she can delete it later. Best-effort: if storage
      // isn't configured the letter has still reached him.
      await apiSend("/api/submissions", "POST", {
        kind: blob ? "video" : "text",
        driveId,
        name: blob ? "her video" : "her letter",
        preview: text.trim().slice(0, 60),
      }).catch(() => {});

      try {
        localStorage.removeItem(draftKey.current);
      } catch {}
      setSent(true);
      burst(200);
    } catch (err) {
      say(
        "It didn't go through: " +
          (err?.message || "unknown error") +
          ". Your words are still here — try again in a moment.",
        "err"
      );
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="card stack g20 center">
        <p className="sent">{STORY.herTurn.thanks}</p>
        <p className="body mx center">
          He has it now — the words, and the video if you recorded one. If you change your
          mind, you can take it back from Settings.
        </p>
      </div>
    );
  }

  return (
    <div className="stack g28">
      <div className="stack g8">
        <textarea
          id="her-letter"
          className="herbox"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={STORY.herTurn.placeholder}
          maxLength={20000}
        />
        <p className="counter">{text.length} characters</p>
      </div>

      <Recorder
        kind="video"
        maxSeconds={120}
        disabled={sending}
        onReady={(b) => setBlob(b)}
        onCleared={() => setBlob(null)}
      />

      <p className="finehint">
        Your words come to Sayak by email. A video goes to a private folder in his Google
        Drive. Nothing is sent until you press the button below, and you can delete any of it
        afterwards.
      </p>

      {sending && progress > 0 && (
        <div className="progress">
          <span style={{ width: progress + "%" }} />
        </div>
      )}

      <p className={"statusline " + kind} role="status">
        {status || " "}
      </p>

      <div className="row c">
        <button className="btn solid" type="button" onClick={send} disabled={sending}>
          {sending ? "Sending…" : "Send it to him"}
        </button>
      </div>
    </div>
  );
}
