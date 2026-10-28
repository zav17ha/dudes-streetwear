import { useId } from "react";
import { LOGO_FULL, MARK, WORDMARK } from "./paths";

type Variant = "mark" | "wordmark" | "full";
const SHAPES = { mark: MARK, wordmark: WORDMARK, full: LOGO_FULL } as const;

type Props = {
  variant?: Variant;
  /** "fire" = white-to-silver brand gradient; "current" = inherits text colour */
  tone?: "fire" | "current";
  className?: string;
  title?: string;
};

export function Logo({ variant = "wordmark", tone = "fire", className, title = "Dudes Streetwear" }: Props) {
  const id = useId().replace(/:/g, "");
  const shape = SHAPES[variant];
  return (
    <svg viewBox={shape.viewBox} className={className} role="img" aria-label={title} xmlns="http://www.w3.org/2000/svg">
      {tone === "fire" && (
        <defs>
          <linearGradient id={`fire-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset=".55" stopColor="#f3f0fb" />
            <stop offset="1" stopColor="#b2a6d4" />
          </linearGradient>
        </defs>
      )}
      <path d={shape.d} fillRule="evenodd" fill={tone === "fire" ? `url(#fire-${id})` : "currentColor"} />
    </svg>
  );
}
