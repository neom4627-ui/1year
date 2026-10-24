/* Everything she has sent, and the ability to take it back.

   A delete button that only hides a row is dishonest, so DELETE here
   really removes the file from Drive before dropping the record.
*/

import { requireWho } from "../../../lib/identity";
import { putItem, listItems, getItem, removeItem, dbConfigured } from "../../../lib/db";
import { deleteDriveFile, driveConfigured } from "../../../lib/google";

export const runtime = "nodejs";

function fail(err) {
  return new Response(err.message || "Error", { status: err.status || 500 });
}

export async function GET(req) {
  try {
    const who = requireWho(new URL(req.url).searchParams.get("passcode"));
    if (!dbConfigured()) return Response.json({ who, items: [] });
    const all = await listItems("submission");
    // You each only see your own.
    return Response.json({ who, items: all.filter((s) => s.who === who) });
  } catch (err) {
    return fail(err);
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const who = requireWho(body.passcode);
    if (!dbConfigured()) return Response.json({ ok: true, skipped: true });

    const item = await putItem(
      "submission",
      {
        who,
        kind: ["video", "audio", "text"].includes(body.kind) ? body.kind : "text",
        driveId: typeof body.driveId === "string" ? body.driveId.slice(0, 120) : null,
        name: String(body.name || "").slice(0, 160),
        preview: String(body.preview || "").slice(0, 200),
        at: Date.now(),
      },
      Date.now()
    );
    return Response.json({ item });
  } catch (err) {
    return fail(err);
  }
}

export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const who = requireWho(url.searchParams.get("passcode"));
    const id = url.searchParams.get("id");

    const existing = await getItem("submission", id);
    if (!existing) return new Response("Nothing to delete", { status: 404 });
    if (existing.who !== who) return new Response("Not yours", { status: 403 });

    if (existing.driveId && driveConfigured()) {
      await deleteDriveFile(existing.driveId);
    }
    await removeItem("submission", id);
    return Response.json({ ok: true, removedFromDrive: Boolean(existing.driveId) });
  } catch (err) {
    return fail(err);
  }
}
