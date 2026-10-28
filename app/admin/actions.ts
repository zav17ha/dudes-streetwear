"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { SESSION_COOKIE, SESSION_TTL_LONG, SESSION_TTL_SHORT, createSessionToken, adminConfigured } from "@/lib/auth";
import { createUser, deleteUser, updateUser, verifyCredentials, type Role } from "@/lib/users";
import { getSession, isAdmin } from "@/lib/session";
import { StorageError, deleteProduct, getProductById, saveProduct, updateProductFlags } from "@/lib/store";
import { removeImages } from "@/lib/media";
import type { Product, ProductInput } from "@/lib/types";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

// Simple in-memory throttle for login attempts (per server instance)
const attempts = new Map<string, { count: number; until: number }>();

export async function login(_: unknown, formData: FormData): Promise<{ error?: string }> {
  if (!adminConfigured()) return { error: "Admin is not set up yet. Add an ADMIN_PASSWORD environment variable and redeploy." };

  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";
  if (!username || !password) return { error: "Enter your username and password." };

  const now = Date.now();
  const rec = attempts.get(username);
  if (rec && rec.until > now) return { error: "Too many attempts. Try again in a minute." };

  const user = await verifyCredentials(username, password);
  if (!user) {
    const count = (rec?.count ?? 0) + 1;
    attempts.set(username, { count, until: count >= 5 ? now + 60_000 : 0 });
    return { error: "Wrong username or password." };
  }
  attempts.delete(username);

  const ttl = remember ? SESSION_TTL_LONG : SESSION_TTL_SHORT;
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await createSessionToken(user.username, ttl), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(remember ? { maxAge: ttl } : {}),
  });
  redirect("/admin");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

function refreshStore() {
  revalidatePath("/", "layout");
}

function clean(input: ProductInput): ProductInput {
  const list = (v: unknown) =>
    Array.isArray(v) ? Array.from(new Set(v.map((s) => String(s).trim()).filter(Boolean))) : [];
  const price = Math.max(0, Math.round(Number(input.price) || 0));
  const compare = Number(input.compareAtPrice) || 0;
  return {
    id: input.id || undefined,
    slug: String(input.slug ?? "").trim(),
    name: String(input.name ?? "").trim().slice(0, 120),
    price,
    compareAtPrice: compare > price ? Math.round(compare) : null,
    category: String(input.category ?? "").trim().slice(0, 40) || "T-Shirts",
    description: String(input.description ?? "").trim().slice(0, 2000),
    details: list(input.details).slice(0, 12),
    sizes: list(input.sizes).slice(0, 12),
    colors: list(input.colors).slice(0, 12),
    images: list(input.images).slice(0, 10),
    isNew: Boolean(input.isNew),
    featured: Boolean(input.featured),
    soldOut: Boolean(input.soldOut),
    hidden: Boolean(input.hidden),
  };
}

function fail(err: unknown): ActionResult {
  console.error(err);
  if (err instanceof StorageError) return { ok: false, error: err.message };
  return { ok: false, error: "Something went wrong while saving. Please try again." };
}

export async function saveProductAction(input: ProductInput): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "Your session expired. Please log in again." };
  const data = clean(input);
  if (!data.name) return { ok: false, error: "Product name is required." };
  if (!data.price) return { ok: false, error: "Price is required." };
  if (!data.images.length) return { ok: false, error: "Add at least one image." };

  try {
    const previous = data.id ? await getProductById(data.id) : null;
    const saved = await saveProduct(data);
    if (previous) await removeImages(previous.images.filter((src) => !saved.images.includes(src)));
    refreshStore();
    return { ok: true, id: saved.id };
  } catch (err) {
    return fail(err);
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "Your session expired. Please log in again." };
  try {
    const removed = await deleteProduct(id);
    if (removed) await removeImages(removed.images);
    refreshStore();
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function toggleFlagAction(id: string, flag: keyof Pick<Product, "featured" | "soldOut" | "hidden" | "isNew">, value: boolean): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "Your session expired. Please log in again." };
  try {
    await updateProductFlags(id, { [flag]: value });
    refreshStore();
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

// ── Team logins ───────────────────────────────────────────────

async function requireAdminRole(): Promise<ActionResult | null> {
  const me = await getSession();
  if (!me) return { ok: false, error: "Your session expired. Please log in again." };
  if (me.role !== "admin") return { ok: false, error: "Only admins can manage logins." };
  return null;
}

export async function createUserAction(input: { username: string; name: string; password: string; role: Role }): Promise<ActionResult> {
  const denied = await requireAdminRole();
  if (denied) return denied;
  try {
    await createUser(input);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function updateUserAction(username: string, changes: { name?: string; role?: Role; password?: string }): Promise<ActionResult> {
  const denied = await requireAdminRole();
  if (denied) return denied;
  try {
    await updateUser(username, changes);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function deleteUserAction(username: string): Promise<ActionResult> {
  const denied = await requireAdminRole();
  if (denied) return denied;
  const me = await getSession();
  if (me?.username === username) return { ok: false, error: "You can't remove your own login." };
  try {
    await deleteUser(username);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}
