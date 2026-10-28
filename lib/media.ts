import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { put, del } from "@vercel/blob";

/**
 * Where product photos go.
 *
 *  - "blob":  Vercel Blob. Connected stores provide either BLOB_READ_WRITE_TOKEN (older stores)
 *             or BLOB_STORE_ID, which signs in automatically with Vercel's built-in OIDC token.
 *  - "local": public/uploads — local development without Blob.
 *  - "none":  deployed without a Blob store.
 */
export function mediaMode(): "blob" | "local" | "none" {
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) return "blob";
  if (!process.env.VERCEL) return "local";
  return "none";
}

/** Photos in a *private* Blob store are served through our own route (app/media). */
export const PRIVATE_MEDIA_PREFIX = "/media/";

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
    const options = { contentType: file.type, cacheControlMaxAge: 60 * 60 * 24 * 365 };
    try {
      const blob = await put(name, file, { ...options, access: "public" });
      return blob.url;
    } catch (publicError) {
      // The store may have been created as private: store it privately and serve it ourselves.
      try {
        const blob = await put(name, file, { ...options, access: "private" });
        return `${PRIVATE_MEDIA_PREFIX}${blob.pathname}`;
      } catch {
        console.error("Blob upload failed", publicError);
        throw new Error(`Upload to Vercel Blob failed: ${publicError instanceof Error ? publicError.message : "unknown error"}`);
      }
    }
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
  const blobTargets = [
    ...urls.filter((u) => u.includes(".blob.vercel-storage.com/")),
    ...urls.filter((u) => u.startsWith(PRIVATE_MEDIA_PREFIX)).map((u) => u.slice(PRIVATE_MEDIA_PREFIX.length)),
  ];
  const localUrls = urls.filter((u) => u.startsWith("/uploads/"));
  try {
    if (blobTargets.length && mediaMode() === "blob") await del(blobTargets);
    for (const u of localUrls) await fs.rm(path.join(process.cwd(), "public", u), { force: true });
  } catch (err) {
    console.error("Failed to remove images", err);
  }
}
