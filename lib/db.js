/* Storage layer — Upstash Redis over its REST API.

   Why Redis and not Postgres: this is two people and a few dozen records.
   Serverless functions and pooled SQL connections are a tax you don't need
   at this size. The REST API means no SDK, no connection pool, no migrations.

   Set up: Vercel dashboard → Storage → Upstash Redis → Connect.
   That injects the env vars automatically. Both naming schemes are accepted
   below because Vercel has used KV_* and UPSTASH_* at different times.
*/

const URL =
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.KV_REST_API_URL ||
  "";
const TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.KV_REST_API_TOKEN ||
  "";

export function dbConfigured() {
  return Boolean(URL && TOKEN);
}

async function cmd(args) {
  if (!dbConfigured()) throw new Error("Storage is not configured on the server");
  const res = await fetch(URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Storage error: " + (await res.text()));
  const json = await res.json();
  if (json.error) throw new Error("Storage error: " + json.error);
  return json.result;
}

async function pipeline(commands) {
  if (!commands.length) return [];
  const res = await fetch(URL + "/pipeline", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Storage error: " + (await res.text()));
  const rows = await res.json();
  return rows.map((r) => r.result);
}

export function newId() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

/* ── generic collection helpers ──────────────────────────────────────
   Each collection is a sorted set of ids (scored by sort key) plus one
   JSON string per item. Small, obvious, and easy to inspect by hand. */

export async function putItem(collection, item, score) {
  const id = item.id || newId();
  const record = { ...item, id };
  await pipeline([
    ["SET", `${collection}:${id}`, JSON.stringify(record)],
    ["ZADD", collection, String(score ?? Date.now()), id],
  ]);
  return record;
}

export async function listItems(collection, { newestFirst = true } = {}) {
  const ids = await cmd(
    newestFirst
      ? ["ZRANGE", collection, "0", "-1", "REV"]
      : ["ZRANGE", collection, "0", "-1"]
  );
  if (!ids || !ids.length) return [];
  const rows = await pipeline(ids.map((id) => ["GET", `${collection}:${id}`]));
  return rows
    .map((r) => {
      try {
        return typeof r === "string" ? JSON.parse(r) : r;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

export async function getItem(collection, id) {
  const raw = await cmd(["GET", `${collection}:${id}`]);
  if (!raw) return null;
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

export async function patchItem(collection, id, changes) {
  const existing = await getItem(collection, id);
  if (!existing) return null;
  const merged = { ...existing, ...changes, id };
  await cmd(["SET", `${collection}:${id}`, JSON.stringify(merged)]);
  return merged;
}

export async function removeItem(collection, id) {
  await pipeline([
    ["DEL", `${collection}:${id}`],
    ["ZREM", collection, id],
  ]);
  return true;
}

/* ── plain key/value, for the quiz and the time capsule ───────────── */

export async function setKey(key, value) {
  await cmd(["SET", key, JSON.stringify(value)]);
  return value;
}

export async function getKey(key) {
  const raw = await cmd(["GET", key]);
  if (!raw) return null;
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

export async function delKey(key) {
  await cmd(["DEL", key]);
  return true;
}

/* ── the "she opened it" ping ─────────────────────────────────────── */

export async function recordVisit(who) {
  await cmd(["LPUSH", "visits", JSON.stringify({ who, at: Date.now() })]);
  await cmd(["LTRIM", "visits", "0", "199"]);
  const first = await cmd(["GET", `first-visit:${who}`]);
  if (!first) {
    await cmd(["SET", `first-visit:${who}`, String(Date.now())]);
    return { first: true };
  }
  return { first: false };
}
