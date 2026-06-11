"use client";

import { useEffect, useRef } from "react";

/**
 * Rotating 3D particle sphere — real 3D projection on a 2D canvas.
 * Zero dependencies, theme-aware (reads --c-accent / --c-gold),
 * DPR-capped, paused for prefers-reduced-motion.
 */
export function EnergySphere({
  className,
  size = 420,
}: {
  className?: string;
  size?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DPR = Math.min(devicePixelRatio || 1, 2);
    canvas.width = size * DPR;
    canvas.height = size * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // Fibonacci sphere — evenly distributed points
    const N = 260;
    const pts: { x: number; y: number; z: number; gold: boolean }[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const a = phi * i;
      pts.push({
        x: Math.cos(a) * r,
        y,
        z: Math.sin(a) * r,
        gold: i % 9 === 0,
      });
    }

    function colors() {
      const css = getComputedStyle(document.documentElement);
      return {
        accent: css.getPropertyValue("--c-accent").trim() || "116 148 107",
        gold: css.getPropertyValue("--c-gold").trim() || "178 144 73",
      };
    }

    const R = size * 0.36;
    const cx = size / 2;
    const cy = size / 2;
    const persp = 3.2;
    let raf = 0;
    let t = 0;

    function frame() {
      const { accent, gold } = colors();
      ctx!.clearRect(0, 0, size, size);

      const ry = t * 0.00035; // slow Y rotation
      const rx = Math.sin(t * 0.00012) * 0.35 + 0.25; // gentle X tilt
      const cosY = Math.cos(ry), sinY = Math.sin(ry);
      const cosX = Math.cos(rx), sinX = Math.sin(rx);

      // soft core glow
      const g = ctx!.createRadialGradient(cx, cy, 0, cx, cy, R * 1.05);
      g.addColorStop(0, `rgb(${accent} / 0.16)`);
      g.addColorStop(1, `rgb(${accent} / 0)`);
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.arc(cx, cy, R * 1.05, 0, Math.PI * 2);
      ctx!.fill();

      const projected = pts
        .map((p) => {
          // rotate Y then X
          const x1 = p.x * cosY + p.z * sinY;
          const z1 = -p.x * sinY + p.z * cosY;
          const y1 = p.y * cosX - z1 * sinX;
          const z2 = p.y * sinX + z1 * cosX;
          const s = persp / (persp - z2); // perspective scale
          return { sx: cx + x1 * R * s, sy: cy + y1 * R * s, depth: z2, gold: p.gold };
        })
        .sort((a, b) => a.depth - b.depth);

      for (const p of projected) {
        const near = (p.depth + 1) / 2; // 0 back → 1 front
        const alpha = 0.12 + near * 0.75;
        const rad = 0.8 + near * 1.9;
        ctx!.fillStyle = `rgb(${p.gold ? gold : accent} / ${alpha.toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(p.sx, p.sy, rad, 0, Math.PI * 2);
        ctx!.fill();
      }

      t += 16.7;
      if (!reduced) raf = requestAnimationFrame(frame);
    }

    frame(); // always draw at least one static frame
    return () => cancelAnimationFrame(raf);
  }, [size]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ width: size, height: size }}
      className={className}
    />
  );
}
