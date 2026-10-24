/* How well do we know each other.

   Both answer privately. Neither set of answers is sent to the browser
   until both have submitted — same reasoning as the sealed letters.
   Once both are in, everything opens at once.
*/

import { requireWho, otherOf } from "../../../lib/identity";
import { getKey, setKey, delKey } from "../../../lib/db";
import { STORY } from "../../story";

export const runtime = "nodejs";

function fail(err) {
  return new Response(err.message || "Error", { status: err.status || 500 });
}

const key = (who, round) => `quiz:${round}:${who}`;

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const who = requireWho(url.searchParams.get("passcode"));
    const round = (url.searchParams.get("round") || "2026").slice(0, 12);
    const other = otherOf(who);

    const [mine, theirs] = await Promise.all([
      getKey(key(who, round)),
      getKey(key(other, round)),
    ]);

    const bothIn = Boolean(mine && theirs);

    return Response.json({
      who,
      round,
      questions: STORY.quizQuestions,
      mine: mine || null,
      // Their answers stay on the server until you've committed yours.
      theirs: bothIn ? theirs : null,
      theySubmitted: Boolean(theirs),
      bothIn,
    });
  } catch (err) {
    return fail(err);
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const who = requireWho(body.passcode);
    const round = String(body.round || "2026").slice(0, 12);

    const answers = {};
    for (const q of STORY.quizQuestions) {
      answers[q.id] = String(body.answers?.[q.id] || "").trim().slice(0, 600);
    }
    if (!Object.values(answers).some(Boolean)) {
      return new Response("Answer at least one", { status: 400 });
    }

    const mine = { answers, submittedAt: Date.now() };
    await setKey(key(who, round), mine);

    const theirs = await getKey(key(otherOf(who), round));
    return Response.json({
      mine,
      theirs: theirs || null,
      theySubmitted: Boolean(theirs),
      bothIn: Boolean(theirs),
    });
  } catch (err) {
    return fail(err);
  }
}

/* Lets either of you redo your own answers before the other has looked. */
export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const who = requireWho(url.searchParams.get("passcode"));
    const round = (url.searchParams.get("round") || "2026").slice(0, 12);
    await delKey(key(who, round));
    return Response.json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
