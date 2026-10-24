/* Fallback upload path: the video comes through this route instead of
   going straight to Google. Serverless platforms cap request bodies
   (about 4.5 MB on Vercel's Hobby plan), so this only works for short
   clips. The direct resumable upload in /api/drive-session is the
   primary route and has no such limit. */

import { STORY } from "../../story";
import { driveConfigured, uploadBuffer } from "../../../lib/google";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req) {
  try {
    if (!driveConfigured()) {
      return new Response("Drive is not configured on the server", { status: 500 });
    }

    const form = await req.formData();
    const passcode = form.get("passcode");
    const file = form.get("file");

    if (String(passcode || "").toLowerCase() !== STORY.passcode.toLowerCase()) {
      return new Response("Not allowed", { status: 403 });
    }
    if (!file || typeof file === "string") {
      return new Response("No file", { status: 400 });
    }
    if (!/^(video|audio)\//.test(file.type || "")) {
      return new Response("Only video or audio", { status: 415 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const out = await uploadBuffer({
      filename: String(file.name || "debi-video.webm")
        .replace(/[^\w.\-]/g, "_")
        .slice(0, 120),
      mimeType: file.type,
      buffer,
    });

    return Response.json({
      ok: true,
      id: out.id,
      link: out.webViewLink || `https://drive.google.com/file/d/${out.id}/view`,
    });
  } catch (err) {
    return new Response("Upload failed: " + (err?.message || "unknown"), { status: 500 });
  }
}
