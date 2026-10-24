/* Letters to your future selves.

   The important part: a sealed letter's text NEVER leaves the server
   before its reveal date. The API strips the body out. Hiding it with
   CSS would mean the words are sitting in the page source, one devtools
   click from being read — which would make the whole gesture a lie.

   You can always read your own letters back. The seal is against the
   other person, and against your own impatience on their behalf.
*/

import { requireWho } from "../../../lib/identity";
import { putItem, listItems, getItem, removeItem } from "../../../lib/db";

export const runtime = "nodejs";

function fail(err) {
  return new Response(err.message || "Error", { status: err.status || 500 });
}

function isOpen(letter) {
  const t = new Date(letter.revealOn + "T00:00:00+05:30").getTime();
  return Date.now() >= t;
}

function redact(letter, who) {
  const open = isOpen(letter);
  const mine = letter.author === who;
  if (open || mine) return { ...letter, sealed: !open };
  // Someone else's letter, still sealed: send the shape, not the contents.
  return {
    id: letter.id,
    author: letter.author,
    revealOn: letter.revealOn,
    createdAt: letter.createdAt,
    title: letter.title || null,
    sealed: true,
    body: null,
    wordCount: letter.wordCount || null,
  };
}

export async function GET(req) {
  try {
    const who = requireWho(new URL(req.url).searchParams.get("passcode"));
    const all = await listItems("letter");
    return Response.json({
      who,
      items: all.map((l) => redact(l, who)),
      now: new Date().toISOString().slice(0, 10),
    });
  } catch (err) {
    return fail(err);
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const who = requireWho(body.passcode);

    const text = String(body.body || "").trim();
    if (!text) return new Response("The letter is empty", { status: 400 });
    if (text.length > 20000) return new Response("Too long", { status: 413 });

    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.revealOn || "")) {
      return new Response("Pick a reveal date", { status: 400 });
    }
    if (new Date(body.revealOn + "T00:00:00+05:30").getTime() <= Date.now()) {
      return new Response("The reveal date has to be in the future", { status: 400 });
    }

    const item = await putItem(
      "letter",
      {
        author: who,
        title: String(body.title || "").trim().slice(0, 120) || null,
        body: text,
        wordCount: text.split(/\s+/).filter(Boolean).length,
        revealOn: body.revealOn,
        createdAt: Date.now(),
      },
      Date.now()
    );

    return Response.json({ item: redact(item, who) });
  } catch (err) {
    return fail(err);
  }
}

export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const who = requireWho(url.searchParams.get("passcode"));
    const id = url.searchParams.get("id");
    const existing = await getItem("letter", id);
    if (!existing) return new Response("No such letter", { status: 404 });
    if (existing.author !== who) {
      return new Response("That letter isn't yours", { status: 403 });
    }
    await removeItem("letter", id);
    return Response.json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
