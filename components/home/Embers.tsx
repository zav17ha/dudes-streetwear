"use client";

import { useEffect, useRef } from "react";

type Speck = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; alpha: number };

/** Pre-rendered soft dot, drawn with drawImage (much cheaper than per-frame gradients). */
function makeSprite() {
  const s = document.createElement("canvas");
  s.width = s.height = 32;
  const c = s.getContext("2d")!;
  const g = c.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, "rgba(240,234,255,1)");
  g.addColorStop(0.25, "rgba(214,200,255,0.55)");
  g.addColorStop(1, "rgba(200,180,255,0)");
  c.fillStyle = g;
  c.fillRect(0, 0, 32, 32);
  return s;
}

/** Slowly rising light specks drawn on a canvas. Pauses when off-screen or the tab is hidden. */
export function Embers({ density = 1, className }: { density?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const sprite = makeSprite();
    const specks: Speck[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;

    const spawn = (anywhere = false): Speck => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 10,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(0.25 + Math.random() * 0.9),
      life: 0,
      max: 220 + Math.random() * 280,
      size: 2 + Math.random() * 5,
      alpha: 0.25 + Math.random() * 0.55,
    });

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      // 1x resolution is plenty for soft dots and halves the pixel work on retina screens
      canvas.width = w;
      canvas.height = h;
      const target = Math.min(70, Math.round(((w * h) / 18000) * density));
      while (specks.length < target) specks.push(spawn(true));
      specks.length = target;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < specks.length; i++) {
        const s = specks[i];
        s.life++;
        s.x += s.vx;
        s.y += s.vy;
        const k = 1 - s.life / s.max;
        if (k <= 0 || s.y < -10) {
          specks[i] = spawn();
          continue;
        }
        ctx.globalAlpha = s.alpha * Math.min(1, k * 2);
        ctx.drawImage(sprite, s.x - s.size, s.y - s.size, s.size * 2, s.size * 2);
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (visible && !document.hidden) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", start);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", start);
    };
  }, [density]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
