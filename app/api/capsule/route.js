/* The anniversary time capsule. Three questions each, sealed until
   STORY.capsuleOpensOn. Like the letters, sealed means sealed — the
   answers don't travel to the browser before the date. */

import { requireWho, otherOf } from "../../../lib/identity";
import { getKey, setKey } from "../../../lib/db";
import { STORY } from "../../story";

export const runtime = "nodejs";

function fail(err) {
  return new Response(err.message || "Error", { status: err.status || 500 });
}

const key = (who, year) => `capsule:${year}:${who}`;

function opensAt() {
  return new Date(STORY.capsuleOpensOn + "T00:00:00+05:30").getTime();
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const who = requireWho(url.searchParams.get("passcode"));
    const year = (url.searchParams.get("year") || "2026").slice(0, 8);
    const open = Date.now() >= opensAt();

    const [mine, theirs] = await Promise.all([
      getKey(key(who, year)),
      getKey(key(otherOf(who), year)),
    ]);

    return Response.json({
      who,
      year,
      questions: STORY.capsuleQuestions,
      opensOn: STORY.capsuleOpensOn,
      open,
      mine: mine || null,
      theirs: open ? theirs || null : null,
      theySubmitted: Boolean(theirs),
    });
  } catch (err) {
    return fail(err);
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const who = requireWho(body.passcode);
    const year = String(body.year || "2026").slice(0, 8);

    const existing = await getKey(key(who, year));
    if (existing) {
      return new Response("You've already sealed this year's capsule", { status: 409 });
    }

    const answers = {};
    for (const q of STORY.capsuleQuestions) {
      answers[q.id] = String(body.answers?.[q.id] || "").trim().slice(0, 3000);
    }
    if (!Object.values(answers).some(Boolean)) {
      return new Response("Answer at least one", { status: 400 });
    }

    const mine = { answers, submittedAt: Date.now() };
    await setKey(key(who, year), mine);
    return Response.json({ mine, sealed: true });
  } catch (err) {
    return fail(err);
  }
}
