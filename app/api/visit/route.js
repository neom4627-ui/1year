/* Tells you the moment she first opens it.

   Fires once per person, the first time they get past the gate. Silent
   and best-effort: if storage or email is down, the site carries on
   without noticing.
*/

import { whoIs } from "../../../lib/identity";
import { recordVisit, dbConfigured } from "../../../lib/db";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { passcode } = await req.json();
    const who = whoIs(passcode);
    if (!who) return new Response("Not allowed", { status: 403 });
    if (!dbConfigured()) return Response.json({ ok: true, skipped: true });

    const { first } = await recordVisit(who);

    // Only tell you about her first ever visit. After that it's noise.
    if (first && who === "debi" && process.env.RESEND_API_KEY && process.env.MY_EMAIL) {
      const when = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.MAIL_FROM || "Our Little Universe <onboarding@resend.dev>",
          to: [process.env.MY_EMAIL],
          subject: "She just opened it",
          text: `Debi opened the site for the first time at ${when} IST.`,
        }),
      }).catch(() => {});
    }

    return Response.json({ ok: true, first });
  } catch {
    return Response.json({ ok: true });
  }
}
