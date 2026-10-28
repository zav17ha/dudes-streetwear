import { get } from "@vercel/blob";

export const runtime = "nodejs";

/** Serves product photos stored in a private Vercel Blob store. */
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathname = path.map(decodeURIComponent).join("/");
  if (!pathname.startsWith("products/") || pathname.includes("..")) return new Response("Not found", { status: 404 });

  try {
    const result = await get(pathname, { access: "private" });
    if (!result) return new Response("Not found", { status: 404 });
    return new Response(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType ?? "application/octet-stream",
        // File names are unique per upload, so they never change
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
