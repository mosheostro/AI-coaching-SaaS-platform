"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight canvas particle field — slow-drifting glowing orbs that
 * connect when near. Reads theme accent color from CSS variables.
 */
export function Aurora({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const DPR = Math.min(devicePixelRatio || 1, 2);
    const N = 42;

    const particles = Array.from({ length: N }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00045,
      vy: (Math.random() - 0.5) * 0.00045,
      r: 1 + Math.random() * 1.8,
    }));

    function resize() {
      if (!canvas) return;
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function accent(): string {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue("--c-accent")
        .trim();
      return v || "116 148 107";
    }

    function frame() {
      ctx!.clearRect(0, 0, w, h);
      const c = accent();

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
      }

      // connections
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = (a.x - b.x) * w;
          const dy = (a.y - b.y) * h;
          const d = Math.hypot(dx, dy);
          if (d < 130) {
            ctx!.strokeStyle = `rgb(${c} / ${(0.16 * (1 - d / 130)).toFixed(3)})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x * w, a.y * h);
            ctx!.lineTo(b.x * w, b.y * h);
            ctx!.stroke();
          }
        }
      }

      // orbs
      for (const p of particles) {
        const g = ctx!.createRadialGradient(
          p.x * w, p.y * h, 0,
          p.x * w, p.y * h, p.r * 5
        );
        g.addColorStop(0, `rgb(${c} / 0.55)`);
        g.addColorStop(1, `rgb(${c} / 0)`);
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(p.x * w, p.y * h, p.r * 5, 0, Math.PI * 2);
        ctx!.fill();
      }

      raf = requestAnimationFrame(frame);
    }

    resize();
    frame();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className ?? "absolute inset-0 h-full w-full"}
    />
  );
}
