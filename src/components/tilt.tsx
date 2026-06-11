"use client";

import { useRef } from "react";

/**
 * Pointer-tracking 3D perspective tilt with light glare.
 * Pure CSS transforms, disabled on touch devices automatically.
 */
export function Tilt({
  children,
  className,
  max = 7,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - py) * max;
    const ry = (px - 0.5) * max;
    el.style.transform = `perspective(800px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(6px)`;
    const glare = glareRef.current;
    if (glare) {
      glare.style.opacity = "1";
      glare.style.background = `radial-gradient(360px circle at ${px * 100}% ${py * 100}%, rgb(255 255 255 / 0.10), transparent 60%)`;
    }
  }

  function onLeave() {
    const el = ref.current;
    if (el) el.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
    if (glareRef.current) glareRef.current.style.opacity = "0";
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={className}
      style={{ transition: "transform 0.25s ease-out", transformStyle: "preserve-3d", willChange: "transform" }}
    >
      <div
        ref={glareRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-card opacity-0"
        style={{ transition: "opacity 0.3s" }}
      />
      {children}
    </div>
  );
}
