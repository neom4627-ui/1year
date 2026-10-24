"use client";

import { useEffect, useRef, useState } from "react";
import { getPass } from "../../lib/api";

/* Shared recorder for both video and voice notes.

   Nothing is uploaded automatically. She records, she watches or listens
   back, and only then does a Send button appear. The destination is
   stated on screen before she ever presses record.
*/

function pickMime(kind) {
  if (typeof MediaRecorder === "undefined") return null;
  const list =
    kind === "audio"
      ? ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"]
      : ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
  return list.find((t) => MediaRecorder.isTypeSupported(t)) || null;
}

export function fmt(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export default function Recorder({ kind = "video", maxSeconds = 120, onReady, onCleared, disabled }) {
  const [stage, setStage] = useState("idle");
  const [seconds, setSeconds] = useState(0);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState(false);

  const mediaRef = useRef(null);
  const streamRef = useRef(null);
  const recRef = useRef(null);
  const chunks = useRef([]);
  const tick = useRef(null);
  const url = useRef(null);
  const secs = useRef(0);

  useEffect(
    () => () => {
      clearInterval(tick.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (url.current) URL.revokeObjectURL(url.current);
    },
    []
  );

  const start = async () => {
    const mime = pickMime(kind);
    if (!navigator.mediaDevices?.getUserMedia || !mime) {
      setErr(true);
      setMsg("This browser can't record. You can still write instead.");
      return;
    }
    try {
      const constraints =
        kind === "audio"
          ? { audio: true }
          : { video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }, audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (kind === "video" && mediaRef.current) {
        mediaRef.current.srcObject = stream;
        mediaRef.current.muted = true;
        await mediaRef.current.play().catch(() => {});
      }

      chunks.current = [];
      const rec = new MediaRecorder(stream, {
        mimeType: mime,
        ...(kind === "video" ? { videoBitsPerSecond: 1_200_000 } : { audioBitsPerSecond: 96_000 }),
      });
      rec.ondataavailable = (e) => e.data?.size && chunks.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunks.current, { type: mime });
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        if (url.current) URL.revokeObjectURL(url.current);
        url.current = URL.createObjectURL(blob);

        if (mediaRef.current) {
          mediaRef.current.srcObject = null;
          mediaRef.current.src = url.current;
          mediaRef.current.muted = false;
          mediaRef.current.controls = true;
        }
        setStage("recorded");
        setErr(false);
        setMsg(`${fmt(secs.current)} · ${(blob.size / 1048576).toFixed(1)} MB — have a listen before you send it`);
        onReady?.(blob, secs.current);
      };

      recRef.current = rec;
      rec.start(1000);
      setStage("live");
      setSeconds(0);
      secs.current = 0;
      setErr(false);
      setMsg("Recording. Take your time.");

      tick.current = setInterval(() => {
        secs.current += 1;
        setSeconds(secs.current);
        if (secs.current >= maxSeconds) stop();
      }, 1000);
    } catch (e) {
      setErr(true);
      setMsg(
        e?.name === "NotAllowedError"
          ? "Permission was blocked. Allow it in your browser, or just write instead."
          : "Couldn't start recording. You can still write instead."
      );
    }
  };

  const stop = () => {
    clearInterval(tick.current);
    try {
      if (recRef.current && recRef.current.state !== "inactive") recRef.current.stop();
    } catch {}
  };

  const clear = () => {
    if (url.current) {
      URL.revokeObjectURL(url.current);
      url.current = null;
    }
    setStage("idle");
    setSeconds(0);
    setMsg("");
    setErr(false);
    if (mediaRef.current) {
      mediaRef.current.src = "";
      mediaRef.current.controls = false;
    }
    onCleared?.();
  };

  return (
    <div className="videopane">
      <p className="eyebrow">{kind === "audio" ? "a voice note" : "or say it out loud"}</p>

      {kind === "video" ? (
        <div className="videoshell">
          <video ref={mediaRef} playsInline />
          {stage === "idle" && <span className="hint">up to {fmt(maxSeconds)}</span>}
          {stage === "live" && (
            <span className="reclight">
              <i />
              {fmt(seconds)} / {fmt(maxSeconds)}
            </span>
          )}
        </div>
      ) : (
        <div className="audioshell">
          {stage === "live" ? (
            <div className="bars">
              {Array.from({ length: 9 }, (_, i) => (
                <i key={i} style={{ animationDelay: `${i * 0.08}s` }} />
              ))}
              <span className="rectime">{fmt(seconds)}</span>
            </div>
          ) : (
            <audio ref={mediaRef} style={{ width: "100%" }} />
          )}
          {stage === "idle" && <span className="emptyframe">up to {fmt(maxSeconds)}</span>}
        </div>
      )}

      <div className="row">
        {stage === "idle" && (
          <button className="btn rec" type="button" onClick={start} disabled={disabled}>
            ● Record
          </button>
        )}
        {stage === "live" && (
          <button className="btn" type="button" onClick={stop}>
            ■ Stop
          </button>
        )}
        {stage === "recorded" && (
          <button className="btn" type="button" onClick={clear} disabled={disabled}>
            Record again
          </button>
        )}
      </div>

      {msg && <p className={"statusline " + (err ? "err" : "ok")}>{msg}</p>}
    </div>
  );
}

/* Shared upload path: resumable session first (no size ceiling), our own
   route as the fallback for short clips. Returns the Drive file id. */
export async function uploadToDrive(blob, kind, onProgress) {
  const ext = blob.type.includes("mp4") ? "mp4" : blob.type.startsWith("audio") ? "webm" : "webm";
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
  const name = `debi-${kind}-${stamp}.${ext}`;
  const passcode = getPass();

  try {
    const r = await fetch("/api/drive-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode, filename: name, mimeType: blob.type, size: blob.size, kind }),
    });
    if (!r.ok) throw new Error(await r.text());
    const { uploadUrl } = await r.json();

    const text = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl, true);
      xhr.setRequestHeader("Content-Type", blob.type);
      xhr.upload.onprogress = (e) =>
        e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve(xhr.responseText)
          : reject(new Error("Upload rejected (" + xhr.status + ")"));
      xhr.onerror = () => reject(new Error("Network dropped during upload"));
      xhr.send(blob);
    });

    const parsed = JSON.parse(text || "{}");
    return { id: parsed.id || null, name };
  } catch {
    const fd = new FormData();
    fd.append("passcode", passcode);
    fd.append("kind", kind);
    fd.append("file", blob, name);
    const r2 = await fetch("/api/upload", { method: "POST", body: fd });
    if (!r2.ok) throw new Error(await r2.text());
    const j = await r2.json();
    return { id: j.id || null, name };
  }
}
