"use client";

/* Thin client-side wrapper. The passcode travels with every call —
   it is how the server knows which of you is writing. */

export function getPass() {
  try {
    return localStorage.getItem("ourpass") || "";
  } catch {
    return "";
  }
}

export function setPass(p) {
  try {
    localStorage.setItem("ourpass", p);
  } catch {}
}

async function handle(res) {
  if (!res.ok) throw new Error((await res.text()) || `Request failed (${res.status})`);
  return res.json();
}

export function apiGet(path, params = {}) {
  const q = new URLSearchParams({ ...params, passcode: getPass() });
  return fetch(`${path}?${q}`, { cache: "no-store" }).then(handle);
}

export function apiSend(path, method, body = {}) {
  return fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, passcode: getPass() }),
  }).then(handle);
}

export function apiDelete(path, params = {}) {
  const q = new URLSearchParams({ ...params, passcode: getPass() });
  return fetch(`${path}?${q}`, { method: "DELETE" }).then(handle);
}

/* Uploads a photo to Vercel Blob and returns its public URL.
   The @vercel/blob client asks our own route for a one-shot token. */
export async function uploadPhoto(file) {
  const { upload } = await import("@vercel/blob/client");
  const safe = file.name.replace(/[^\w.\-]/g, "_").slice(0, 80);
  const blob = await upload(`memories/${Date.now()}-${safe}`, file, {
    access: "public",
    handleUploadUrl: "/api/blob",
    clientPayload: JSON.stringify({ passcode: getPass() }),
  });
  return blob.url;
}
