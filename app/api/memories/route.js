/* The memory vault. Either of you can add a memory; the other can add
   their own side of it later. Both perspectives live on one record. */

import { requireWho, otherOf } from "../../../lib/identity";
import { putItem, listItems, patchItem, removeItem, getItem } from "../../../lib/db";

export const runtime = "nodejs";

function fail(err) {
  return new Response(err.message || "Error", { status: err.status || 500 });
}

export async function GET(req) {
  try {
    const who = requireWho(new URL(req.url).searchParams.get("passcode"));
    const items = await listItems("memory");
    return Response.json({ who, items });
  } catch (err) {
    return fail(err);
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const who = requireWho(body.passcode);

    const title = String(body.title || "").trim().slice(0, 140);
    const note = String(body.note || "").trim().slice(0, 4000);
    if (!title) return new Response("A memory needs a title", { status: 400 });

    // Sort by the date the memory happened, not when it was typed, so the
    // vault reads as a timeline rather than a changelog.
    const date = /^\d{4}-\d{2}-\d{2}$/.test(body.date || "")
      ? body.date
      : new Date().toISOString().slice(0, 10);

    const item = await putItem(
      "memory",
      {
        title,
        date,
        photo: typeof body.photo === "string" ? body.photo.slice(0, 600) : null,
        perspectives: { [who]: note || null, [otherOf(who)]: null },
        createdBy: who,
        createdAt: Date.now(),
      },
      new Date(date + "T00:00:00Z").getTime()
    );

    return Response.json({ item });
  } catch (err) {
    return fail(err);
  }
}

/* Add or change your own side of an existing memory. You can only ever
   write to your own perspective — never the other person's. */
export async function PATCH(req) {
  try {
    const body = await req.json();
    const who = requireWho(body.passcode);
    const existing = await getItem("memory", body.id);
    if (!existing) return new Response("No such memory", { status: 404 });

    const note = String(body.note || "").trim().slice(0, 4000);
    const perspectives = { ...(existing.perspectives || {}), [who]: note || null };

    const patch = { perspectives };
    if (typeof body.photo === "string" && !existing.photo) {
      patch.photo = body.photo.slice(0, 600);
    }

    const item = await patchItem("memory", body.id, patch);
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
    const existing = await getItem("memory", id);
    if (!existing) return new Response("No such memory", { status: 404 });

    // Only the person who created it can remove it outright.
    if (existing.createdBy !== who) {
      return new Response("That one isn't yours to delete", { status: 403 });
    }
    await removeItem("memory", id);
    return Response.json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
