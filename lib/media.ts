import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { put, del } from "@vercel/blob";

export function mediaMode(): "blob" | "local" | "none" {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  if (!process.env.VERCEL) return "local";
  return "none";
}

const EXT: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/avif": "avif",
};

export async function storeImage(file: File): Promise<string> {
  const ext = EXT[file.type];
  if (!ext) throw new Error("Unsupported image type. Use JPG, PNG, WebP or AVIF.");
  const name = `products/${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const mode = mediaMode();
  if (mode === "blob") {
    const blob = await put(name, file, {
      access: "public",
      contentType: file.type,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    return blob.url;
  }
  if (mode === "local") {
    const target = path.join(process.cwd(), "public", "uploads", name);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, Buffer.from(await file.arrayBuffer()));
    return `/uploads/${name}`;
  }
  throw new Error("Image storage is not connected. In Vercel, open Storage → create a Blob store for this project, then redeploy.");
}

/** Remove images that are no longer used. Only touches files we uploaded. */
export async function removeImages(urls: string[]) {
  const blobUrls = urls.filter((u) => u.includes(".blob.vercel-storage.com/"));
  const localUrls = urls.filter((u) => u.startsWith("/uploads/"));
  try {
    if (blobUrls.length && process.env.BLOB_READ_WRITE_TOKEN) await del(blobUrls);
    for (const u of localUrls) await fs.rm(path.join(process.cwd(), "public", u), { force: true });
  } catch (err) {
    console.error("Failed to remove images", err);
  }
}
