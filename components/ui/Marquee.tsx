"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/format";

type Props = {
  children: React.ReactNode;
  /** pixels per second */
  speed?: number;
  reverse?: boolean;
  className?: string;
};

/**
 * Infinite ticker. Runs as a CSS animation on the compositor (smooth even when
 * the page is busy) and pauses while off-screen. Content is duplicated so the
 * loop is seamless.
 */
export function Marquee({ children, speed = 60, reverse = false, className }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr) return;

    const measure = () => tr.style.setProperty("--marquee-duration", `${Math.max(4, tr.scrollWidth / 2 / speed)}s`);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(tr);

    const io = new IntersectionObserver(([entry]) => {
      tr.style.animationPlayState = entry.isIntersecting ? "running" : "paused";
    });
    io.observe(el);

    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [speed]);

  return (
    <div ref={root} className={cn("relative flex overflow-hidden select-none", className)}>
      <div
        ref={track}
        className="flex shrink-0 animate-marquee will-change-transform motion-reduce:animate-none"
        style={{ animationDirection: reverse ? "reverse" : "normal" }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
