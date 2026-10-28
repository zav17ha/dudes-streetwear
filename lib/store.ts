import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Redis } from "@upstash/redis";
import type { Product, ProductInput } from "./types";
import { seedProducts } from "./seed";
import { slugify } from "./format";

/**
 * Product storage.
 *
 *  - "redis": Upstash Redis (Vercel → Storage → Upstash). Used in production.
 *  - "file":  .data/products.json — local development without Redis.
 *  - "seed":  read-only demo catalogue (e.g. a Vercel deploy with no database yet).
 */
export type StorageMode = "redis" | "file" | "seed";

const KEY = "dudes:products";
export const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "products.json");

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

let redis: Redis | null = null;
export function getRedis() {
  if (!redisUrl || !redisToken) return null;
  redis ??= new Redis({ url: redisUrl, token: redisToken });
  return redis;
}

export function storageMode(): StorageMode {
  if (redisUrl && redisToken) return "redis";
  if (!process.env.VERCEL) return "file";
  return "seed";
}

export class StorageError extends Error {}

async function readAll(): Promise<Product[]> {
  const mode = storageMode();
  if (mode === "redis") {
    const db = getRedis()!;
    const map = await db.hgetall<Record<string, Product>>(KEY);
    if (!map || Object.keys(map).length === 0) {
      // First run: populate the database with the starter catalogue so the
      // store is never empty. Delete or edit these from the admin panel.
      const initialised = await db.set(`${KEY}:seeded`, "1", { nx: true });
      if (initialised) {
        await writeMany(seedProducts);
        return seedProducts;
      }
      return [];
    }
    return Object.values(map);
  }
  if (mode === "file") {
    try {
      return JSON.parse(await fs.readFile(FILE, "utf8")) as Product[];
    } catch {
      return seedProducts;
    }
  }
  return seedProducts;
}

async function writeMany(products: Product[]) {
  const db = getRedis();
  if (!db || products.length === 0) return;
  await db.hset(KEY, Object.fromEntries(products.map((p) => [p.id, p])));
}

async function writeFile(products: Product[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(products, null, 2));
}

function sortProducts(list: Product[]) {
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** All products, newest first. Pass `includeHidden` for the admin panel. */
export async function getProducts({ includeHidden = false } = {}) {
  const all = sortProducts(await readAll());
  return includeHidden ? all : all.filter((p) => !p.hidden);
}

export async function getProductBySlug(slug: string) {
  const all = await readAll();
  return all.find((p) => p.slug === slug && !p.hidden) ?? null;
}

export async function getProductById(id: string) {
  const all = await readAll();
  return all.find((p) => p.id === id) ?? null;
}

function assertWritable() {
  if (storageMode() === "seed") {
    throw new StorageError(
      "No database connected. In Vercel, open Storage → connect “Upstash for Redis” to this project, then redeploy.",
    );
  }
}

export async function saveProduct(input: ProductInput): Promise<Product> {
  assertWritable();
  const all = await readAll();
  const now = new Date().toISOString();
  const existing = input.id ? all.find((p) => p.id === input.id) : undefined;

  // Unique slug
  const base = slugify(input.slug || input.name) || "product";
  let slug = base;
  for (let i = 2; all.some((p) => p.slug === slug && p.id !== existing?.id); i++) slug = `${base}-${i}`;

  const product: Product = {
    ...input,
    id: existing?.id ?? crypto.randomUUID(),
    slug,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  if (storageMode() === "redis") {
    await getRedis()!.hset(KEY, { [product.id]: product });
  } else {
    const next = existing ? all.map((p) => (p.id === product.id ? product : p)) : [...all, product];
    await writeFile(next);
  }
  return product;
}

export async function updateProductFlags(id: string, flags: Partial<Pick<Product, "featured" | "soldOut" | "hidden" | "isNew">>) {
  const product = await getProductById(id);
  if (!product) throw new StorageError("Product not found");
  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = product;
  return saveProduct({ ...rest, ...flags, id });
}

export async function deleteProduct(id: string): Promise<Product | null> {
  assertWritable();
  const all = await readAll();
  const product = all.find((p) => p.id === id) ?? null;
  if (storageMode() === "redis") {
    await getRedis()!.hdel(KEY, id);
  } else {
    await writeFile(all.filter((p) => p.id !== id));
  }
  return product;
}
