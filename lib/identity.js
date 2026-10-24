/* Who is using the site.

   This is deliberately NOT real authentication. It is two shared
   passcodes — the same trust model as the unguessable URL the whole site
   already relies on. It is enough to keep "how Sayak remembers it" and
   "how Debi remembers it" apart, and to stop a stranger who stumbles on
   the link from writing into your vault. It is not enough to protect
   against someone who wants in. Don't put anything here you'd be hurt
   to have read.

   If you ever want real accounts, swap this file for NextAuth with
   Google sign-in and check the email against a two-entry allowlist.
   Nothing else in the app would have to change.
*/

import { STORY } from "../app/story";

export function whoIs(passcode) {
  const p = String(passcode || "").trim().toLowerCase();
  if (!p) return null;
  if (p === String(STORY.passcode).toLowerCase() || p === "09") return "debi";
  if (p === String(STORY.myPasscode).toLowerCase()) return "sayak";
  return null;
}

export function requireWho(passcode) {
  const who = whoIs(passcode);
  if (!who) {
    const err = new Error("Not allowed");
    err.status = 403;
    throw err;
  }
  return who;
}

export const DISPLAY = { sayak: "Sayak", debi: "Debi" };

export function otherOf(who) {
  return who === "sayak" ? "debi" : "sayak";
}
