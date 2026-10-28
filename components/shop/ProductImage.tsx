import Image, { type ImageProps } from "next/image";

/** Hosts configured in next.config.ts `images.remotePatterns`. */
const OPTIMISED_HOST = /\.public\.blob\.vercel-storage\.com$/;

function canOptimise(src: string) {
  if (src.endsWith(".svg")) return false;
  if (src.startsWith("/")) return true;
  try {
    return OPTIMISED_HOST.test(new URL(src).hostname);
  } catch {
    return false;
  }
}

/** next/image that falls back to the raw file for SVGs and external hosts. */
export function ProductImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  return <Image {...props} unoptimized={props.unoptimized ?? (src ? !canOptimise(src) : false)} />;
}
