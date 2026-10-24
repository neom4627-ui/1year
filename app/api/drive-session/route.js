import { STORY } from "../../story";
import { createResumableSession, driveConfigured } from "../../../lib/google";

export const runtime = "nodejs";

const MAX_BYTES = 200 * 1024 * 1024; // 200 MB is plenty for a 2-minute clip

export async function POST(req) {
  try {
    const { passcode, filename, mimeType, size } = await req.json();

    if (String(passcode || "").toLowerCase() !== STORY.passcode.toLowerCase()) {
      return new Response("Not allowed", { status: 403 });
    }
    if (!driveConfigured()) {
      return new Response("Drive is not configured on the server", { status: 500 });
    }
    if (!filename || !mimeType || !size) {
      return new Response("Missing file details", { status: 400 });
    }
    if (size > MAX_BYTES) {
      return new Response("That video is too large", { status: 413 });
    }
    if (!/^(video|audio)\//.test(mimeType)) {
      return new Response("Only video or audio", { status: 415 });
    }

    const uploadUrl = await createResumableSession({
      filename: String(filename).replace(/[^\w.\-]/g, "_").slice(0, 120),
      mimeType,
      size,
    });

    return Response.json({ uploadUrl });
  } catch (err) {
    return new Response("Could not start the upload: " + (err?.message || "unknown"), {
      status: 500,
    });
  }
}
