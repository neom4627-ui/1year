import { STORY } from "../../story";
import { driveConfigured, uploadBuffer } from "../../../lib/google";

export const runtime = "nodejs";

function esc(s) {
  return String(s || "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

async function sendEmail({ text, videoLink }) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.MY_EMAIL;
  if (!key || !to) throw new Error("Email is not configured on the server");

  const when = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const html = `
    <div style="font-family:Georgia,serif;max-width:620px;margin:0 auto;padding:28px;background:#fff6f8">
      <p style="font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#c4698a;margin:0 0 6px">
        She wrote back
      </p>
      <h1 style="font-family:Georgia,serif;font-weight:400;font-size:26px;color:#4c2b4e;margin:0 0 4px">
        A letter from Debi
      </h1>
      <p style="font-size:13px;color:#8a7088;margin:0 0 22px">${esc(when)} IST</p>
      ${
        text
          ? `<div style="background:#fff;border-radius:12px;padding:22px;white-space:pre-wrap;
               font-size:17px;line-height:1.75;color:#3f2a3c">${esc(text)}</div>`
          : `<p style="color:#8a7088;font-style:italic">She didn't write anything — she recorded it instead.</p>`
      }
      ${
        videoLink
          ? `<p style="margin:22px 0 0;font-size:15px">
               🎥 <a href="${esc(videoLink)}" style="color:#c4698a">Her video is in your Drive</a>
             </p>`
          : ""
      }
      <p style="margin:30px 0 0;font-size:12px;color:#a8929f">
        Sent from the anniversary site.
      </p>
    </div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || "Our Little Universe <onboarding@resend.dev>",
      to: [to],
      subject: "💌 Debi wrote back",
      html,
      text: (text || "(no text — she recorded a video)") + (videoLink ? `\n\nVideo: ${videoLink}` : ""),
    }),
  });

  if (!res.ok) throw new Error("Resend rejected it: " + (await res.text()));
  return res.json();
}

export async function POST(req) {
  try {
    const { passcode, text, videoLink } = await req.json();

    if (String(passcode || "").toLowerCase() !== STORY.passcode.toLowerCase()) {
      return new Response("Not allowed", { status: 403 });
    }
    if (!text && !videoLink) {
      return new Response("Nothing to send", { status: 400 });
    }
    if (text && text.length > 20000) {
      return new Response("Too long", { status: 413 });
    }

    const problems = [];

    // Email is the thing that actually reaches you, so try it first.
    try {
      await sendEmail({ text, videoLink });
    } catch (err) {
      problems.push("email: " + err.message);
    }

    // Keep a copy of her words in Drive too, so nothing is lost if mail fails.
    if (text && driveConfigured()) {
      try {
        const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
        await uploadBuffer({
          filename: `debi-letter-${stamp}.txt`,
          mimeType: "text/plain",
          buffer: Buffer.from(text, "utf8"),
        });
      } catch (err) {
        problems.push("drive copy: " + err.message);
      }
    }

    // Only fail the request if nothing at all got through.
    if (problems.length === 2 || (problems.length === 1 && problems[0].startsWith("email") && !text)) {
      return new Response(problems.join(" | "), { status: 502 });
    }
    if (problems.length && problems[0].startsWith("email") && !driveConfigured()) {
      return new Response(problems.join(" | "), { status: 502 });
    }

    return Response.json({ ok: true, warnings: problems });
  } catch (err) {
    return new Response("Server error: " + (err?.message || "unknown"), { status: 500 });
  }
}
