"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Link2, Loader2, X } from "lucide-react";
import { ProductImage } from "@/components/shop/ProductImage";
import { cn } from "@/lib/format";

const MAX_EDGE = 1800;

/** Resize & re-encode in the browser so uploads are small and fast. */
async function compress(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
    const toBlob = (type: string, q: number) => new Promise<Blob | null>((res) => canvas.toBlob(res, type, q));
    let blob = await toBlob("image/webp", 0.85);
    if (!blob || blob.type !== "image/webp") blob = await toBlob("image/jpeg", 0.86);
    if (!blob) return file;
    const ext = blob.type === "image/webp" ? "webp" : "jpg";
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + "." + ext, { type: blob.type });
  } catch {
    return file;
  }
}

export function ImageUploader({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [url, setUrl] = useState("");

  const upload = async (files: FileList | File[]) => {
    setError(null);
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setUploading((n) => n + list.length);
    let current = value;
    for (const original of list) {
      try {
        const file = await compress(original);
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
        current = [...current, data.url as string];
        onChange(current);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length || from === to) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {value.map((src, i) => (
          <div
            key={src}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIndex !== null) move(dragIndex, i);
              setDragIndex(null);
            }}
            className={cn("group relative aspect-[4/5] cursor-grab overflow-hidden border border-bone/10 bg-smoke", dragIndex === i && "opacity-40")}
          >
            <ProductImage src={src} alt="" fill sizes="200px" className="object-cover" />
            {i === 0 && <span className="bg-fire-x absolute top-2 left-2 px-2 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] text-ink">Cover</span>}
            {i === 1 && <span className="absolute top-2 left-2 bg-bone px-2 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] text-ink">Hover</span>}
            <button
              type="button"
              onClick={() => onChange(value.filter((v) => v !== src))}
              className="absolute top-2 right-2 grid h-8 w-8 place-items-center bg-ink/80 text-bone hover:bg-blood"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute inset-x-2 bottom-2 flex justify-between opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
              <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="grid h-8 w-8 place-items-center bg-ink/80 disabled:opacity-30" aria-label="Move left">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => move(i, i + 1)} disabled={i === value.length - 1} className="grid h-8 w-8 place-items-center bg-ink/80 disabled:opacity-30" aria-label="Move right">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length) upload(e.dataTransfer.files);
          }}
          className={cn(
            "flex aspect-[4/5] flex-col items-center justify-center gap-3 border border-dashed p-4 text-center transition-colors",
            dragOver ? "border-ember bg-ember/10" : "border-bone/25 hover:border-bone/60",
          )}
        >
          {uploading > 0 ? <Loader2 className="h-7 w-7 animate-spin text-ember" /> : <ImagePlus className="h-7 w-7 text-bone/60" />}
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-bone/60">
            {uploading > 0 ? `Uploading ${uploading}…` : "Drop photos or click"}
          </span>
        </button>
      </div>

      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) upload(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="mt-3 flex gap-2">
        <label className="relative flex-1">
          <Link2 className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-bone/40" />
          <input className="field py-2 pl-9 text-sm" placeholder="…or paste an image URL" value={url} onChange={(e) => setUrl(e.target.value)} />
        </label>
        <button
          type="button"
          className="border border-bone/20 px-4 font-mono text-[0.65rem] uppercase tracking-[0.16em] hover:border-bone/60"
          onClick={() => {
            const v = url.trim();
            if (/^(https?:\/\/|\/)/.test(v) && !value.includes(v)) onChange([...value, v]);
            setUrl("");
          }}
        >
          Add
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-flame">{error}</p>}
      <p className="mt-2 text-xs text-bone/40">First image is the cover, second shows on hover. Drag or use the arrows to reorder. Photos are compressed automatically.</p>
    </div>
  );
}
