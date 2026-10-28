import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { DATA_DIR, StorageError, getRedis, storageMode } from "./store";
import { checkPassword } from "./auth";

/**
 * Admin panel accounts.
 *
 *  - The owner account comes from environment variables (ADMIN_USERNAME / ADMIN_PASSWORD)
 *    so there is always a way in, even with an empty database.
 *  - Extra team logins are created from /admin/users and stored next to the products
 *    (Upstash Redis in production, .data/users.json locally). Passwords are scrypt-hashed.
 */
export type Role = "admin" | "editor";

type StoredUser = {
  username: string;
  name: string;
  role: Role;
  hash: string;
  salt: string;
  createdAt: string;
  lastLoginAt: string | null;
};

export type PublicUser = Omit<StoredUser, "hash" | "salt"> & { owner: boolean };

const KEY = "dudes:users";
const FILE = path.join(DATA_DIR, "users.json");
const scrypt = promisify(scryptCb) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

export const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{2,31}$/;
export const MIN_PASSWORD = 8;

export function ownerUsername() {
  return (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
}

function ownerUser(): PublicUser {
  return { username: ownerUsername(), name: "Owner", role: "admin", createdAt: "", lastLoginAt: null, owner: true };
}

export function usersWritable() {
  return storageMode() !== "seed";
}

async function readAll(): Promise<Record<string, StoredUser>> {
  const mode = storageMode();
  if (mode === "redis") return (await getRedis()!.hgetall<Record<string, StoredUser>>(KEY)) ?? {};
  if (mode === "file") {
    try {
      return JSON.parse(await fs.readFile(FILE, "utf8"));
    } catch {
      return {};
    }
  }
  return {};
}

async function write(user: StoredUser) {
  if (storageMode() === "redis") return void (await getRedis()!.hset(KEY, { [user.username]: user }));
  const all = await readAll();
  all[user.username] = user;
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all, null, 2));
}

async function remove(username: string) {
  if (storageMode() === "redis") return void (await getRedis()!.hdel(KEY, username));
  const all = await readAll();
  delete all[username];
  await fs.writeFile(FILE, JSON.stringify(all, null, 2));
}

async function hashPassword(password: string, salt = randomBytes(16)) {
  const hash = await scrypt(password, salt, 64);
  return { hash: hash.toString("hex"), salt: salt.toString("hex") };
}

function toPublic({ hash: _h, salt: _s, ...rest }: StoredUser): PublicUser {
  return { ...rest, owner: false };
}

export async function listUsers(): Promise<PublicUser[]> {
  const all = Object.values(await readAll()).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return [ownerUser(), ...all.map(toPublic)];
}

export async function findUser(username: string): Promise<PublicUser | null> {
  const name = username.toLowerCase();
  if (name === ownerUsername()) return ownerUser();
  const user = (await readAll())[name];
  return user ? toPublic(user) : null;
}

export async function verifyCredentials(username: string, password: string): Promise<PublicUser | null> {
  const name = username.trim().toLowerCase();
  if (name === ownerUsername()) return (await checkPassword(password)) ? ownerUser() : null;

  const user = (await readAll())[name];
  if (!user) {
    await hashPassword(password); // keep timing similar for unknown usernames
    return null;
  }
  const { hash } = await hashPassword(password, Buffer.from(user.salt, "hex"));
  if (!timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(user.hash, "hex"))) return null;
  await write({ ...user, lastLoginAt: new Date().toISOString() }).catch(() => {});
  return toPublic(user);
}

function assertWritable() {
  if (!usersWritable()) {
    throw new StorageError("No database connected. Connect “Upstash for Redis” in Vercel → Storage to add team logins.");
  }
}

export async function createUser(input: { username: string; name: string; password: string; role: Role }) {
  assertWritable();
  const username = input.username.trim().toLowerCase();
  if (!USERNAME_RE.test(username)) throw new StorageError("Username must be 3–32 characters: letters, numbers, dot, dash or underscore.");
  if (input.password.length < MIN_PASSWORD) throw new StorageError(`Password must be at least ${MIN_PASSWORD} characters.`);
  if (username === ownerUsername() || (await readAll())[username]) throw new StorageError("That username is already taken.");
  await write({
    username,
    name: input.name.trim().slice(0, 60) || username,
    role: input.role === "admin" ? "admin" : "editor",
    ...(await hashPassword(input.password)),
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  });
}

export async function updateUser(username: string, changes: { name?: string; role?: Role; password?: string }) {
  assertWritable();
  const user = (await readAll())[username.toLowerCase()];
  if (!user) throw new StorageError("User not found. (The owner account is managed with environment variables.)");
  const next = { ...user };
  if (changes.name !== undefined) next.name = changes.name.trim().slice(0, 60) || user.username;
  if (changes.role) next.role = changes.role === "admin" ? "admin" : "editor";
  if (changes.password !== undefined) {
    if (changes.password.length < MIN_PASSWORD) throw new StorageError(`Password must be at least ${MIN_PASSWORD} characters.`);
    Object.assign(next, await hashPassword(changes.password));
  }
  await write(next);
}

export async function deleteUser(username: string) {
  assertWritable();
  await remove(username.toLowerCase());
}
