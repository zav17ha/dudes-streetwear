/**
 * Signed-cookie sessions for the admin panel.
 * The cookie holds `<username>.<expiry>.<HMAC-SHA256(username.expiry)>`.
 * Works in both the Node.js and Edge runtimes (Web Crypto only).
 */
export const SESSION_COOKIE = "dudes_admin";
export const SESSION_TTL_SHORT = 60 * 60 * 12; // 12 hours
export const SESSION_TTL_LONG = 60 * 60 * 24 * 30; // 30 days ("keep me signed in")

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

async function hmac(value: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(username: string, ttl: number) {
  const expires = Math.floor(Date.now() / 1000) + ttl;
  return `${username}.${expires}.${await hmac(`${username}.${expires}`)}`;
}

/** Returns the signed-in username, or null. */
export async function verifySessionToken(token: string | undefined | null): Promise<string | null> {
  if (!token || !adminConfigured()) return null;
  const parts = token.split(".");
  const sig = parts.pop();
  const expires = parts.pop();
  const username = parts.join(".");
  if (!username || !expires || !sig || Number(expires) < Date.now() / 1000) return null;
  return safeEqual(sig, await hmac(`${username}.${expires}`)) ? username : null;
}

/** Compares against the owner password from ADMIN_PASSWORD. */
export async function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // Compare digests so timing does not leak the password length
  const [a, b] = await Promise.all([hmac(`pw:${input}`), hmac(`pw:${expected}`)]);
  return safeEqual(a, b);
}
