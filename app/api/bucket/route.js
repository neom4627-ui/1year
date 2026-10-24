/* The shared list of small things you want to do. Either of you can add,
   tick off, or attach a photo once it's actually happened. */

import { requireWho } from "../../../lib/identity";
import { putItem, listItems, patchItem, removeItem, getItem } from "../../../lib/db";

export const runtime = "nodejs";

function fail(err) {
  return new Response(err.message || "Error", { status: err.status || 500 });
}

export async function GET(req) {
  try {
    const who = requireWho(new URL(req.url).searchParams.get("passcode"));
    const items = await listItems("bucket", { newestFirst: false });
    // Done things sink to the bottom; the list stays a to-do, not a diary.
    items.sort((a, b) => Number(Boolean(a.done)) - Number(Boolean(b.done)));
    return Response.json({ who, items });
  } catch (err) {
    return fail(err);
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const who = requireWho(body.passcode);
    const text = String(body.text || "").trim().slice(0, 200);
    if (!text) return new Response("Write something first", { status: 400 });

    const item = await putItem(
      "bucket",
      { text, addedBy: who, done: false, doneOn: null, photo: null, createdAt: Date.now() },
      Date.now()
    );
    return Response.json({ item });
  } catch (err) {
    return fail(err);
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const who = requireWho(body.passcode);
    const existing = await getItem("bucket", body.id);
    if (!existing) return new Response("No such item", { status: 404 });

    const patch = {};
    if (typeof body.done === "boolean") {
      patch.done = body.done;
      patch.doneOn = body.done ? new Date().toISOString().slice(0, 10) : null;
      patch.doneBy = body.done ? who : null;
    }
    if (typeof body.photo === "string") patch.photo = body.photo.slice(0, 600);
    if (typeof body.text === "string" && body.text.trim()) {
      patch.text = body.text.trim().slice(0, 200);
    }

    const item = await patchItem("bucket", body.id, patch);
    return Response.json({ item });
  } catch (err) {
    return fail(err);
  }
}

export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    requireWho(url.searchParams.get("passcode"));
    await removeItem("bucket", url.searchParams.get("id"));
    return Response.json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
