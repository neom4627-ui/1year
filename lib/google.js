/* Google Drive access using a long-lived refresh token for YOUR OWN account.
   Files land in your Drive, owned by you, counted against your quota.

   A service account would be tidier, but service accounts have no Drive
   storage quota on personal Google accounts, so uploads fail with
   "Service Accounts do not have storage quota". The refresh-token route
   is the one that actually works for a personal Gmail.

   Required env vars (see .env.example):
     GOOGLE_CLIENT_ID
     GOOGLE_CLIENT_SECRET
     GOOGLE_REFRESH_TOKEN
     GOOGLE_DRIVE_FOLDER_ID
*/

export function driveConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN &&
      process.env.GOOGLE_DRIVE_FOLDER_ID
  );
}

export async function getAccessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Google token refresh failed: " + (await res.text()));
  }
  const json = await res.json();
  return json.access_token;
}

/* Creates a resumable upload session and returns the URL the browser
   can PUT the file to directly. Keeps the token on the server and
   sidesteps the serverless request-body size limit. */
export async function createResumableSession({ filename, mimeType, size }) {
  const token = await getAccessToken();
  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,webViewLink&supportsAllDrives=true",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": mimeType,
        "X-Upload-Content-Length": String(size),
      },
      body: JSON.stringify({
        name: filename,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
        description: "From Debi, via the anniversary site",
      }),
    }
  );
  if (!res.ok) {
    throw new Error("Could not open upload session: " + (await res.text()));
  }
  const uploadUrl = res.headers.get("location") || res.headers.get("Location");
  if (!uploadUrl) throw new Error("Google did not return an upload URL");
  return uploadUrl;
}

/* Straight server-side upload. Used as the fallback path, and for the
   plain-text backup copy of her letter. */
export async function uploadBuffer({ filename, mimeType, buffer }) {
  const token = await getAccessToken();
  const boundary = "----debi" + Math.random().toString(36).slice(2);
  const meta = JSON.stringify({
    name: filename,
    parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    description: "From Debi, via the anniversary site",
  });

  const head = Buffer.from(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n` +
      `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`
  );
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([head, Buffer.from(buffer), tail]);

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );
  if (!res.ok) throw new Error("Drive upload failed: " + (await res.text()));
  return res.json();
}

/* Actually removes the file from Drive. Used by the delete controls —
   a "delete" button that only hides a row would be a lie. */
export async function deleteDriveFile(fileId) {
  const token = await getAccessToken();
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?supportsAllDrives=true`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
  );
  // 404 means it is already gone, which is the outcome we wanted anyway.
  if (!res.ok && res.status !== 404) {
    throw new Error("Could not delete from Drive: " + (await res.text()));
  }
  return true;
}
