/* Photo uploads for the memory vault and bucket list.

   Videos and voice notes go to your Drive (they're private keepsakes).
   Photos that have to render inside the page go to Vercel Blob instead,
   because Drive won't serve a private file into an <img> tag.

   The browser never sees the blob token — it asks this route for a
   one-shot upload URL, same pattern as the Drive resumable session.
*/

import { handleUpload } from "@vercel/blob/client";
import { whoIs } from "../../../lib/identity";

export const runtime = "nodejs";

export async function POST(req) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return new Response("Photo storage is not configured on the server", { status: 500 });
  }

  const body = await req.json();

  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        let passcode = null;
        try {
          passcode = JSON.parse(clientPayload || "{}").passcode;
        } catch {}
        if (!whoIs(passcode)) throw new Error("Not allowed");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
          maximumSizeInBytes: 8 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Nothing to do — the caller stores the returned URL on the record.
      },
    });
    return Response.json(json);
  } catch (err) {
    return new Response(err?.message || "Upload failed", { status: 400 });
  }
}
