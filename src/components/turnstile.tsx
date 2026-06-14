"use client";

import { useEffect, useRef } from "react";

// Minimal typing for the Turnstile global.
declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: { sitekey: string; theme?: string }) => string;
      reset: (id?: string) => void;
    };
  }
}

const SCRIPT_ID = "cf-turnstile-script";
const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/**
 * Cloudflare Turnstile widget. When rendered inside a <form>, Turnstile injects
 * a hidden input named `cf-turnstile-response` that the server action reads.
 * If NEXT_PUBLIC_TURNSTILE_SITE_KEY is unset, it renders nothing (dev fallback).
 */
export function Turnstile() {
  const ref = useRef<HTMLDivElement>(null);
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!sitekey || !ref.current) return;
    const el = ref.current;

    function render() {
      if (window.turnstile && el.childElementCount === 0) {
        window.turnstile.render(el, { sitekey: sitekey! });
      }
    }

    if (!document.getElementById(SCRIPT_ID)) {
      const s = document.createElement("script");
      s.id = SCRIPT_ID;
      s.src = SCRIPT_SRC;
      s.async = true;
      s.defer = true;
      s.onload = render;
      document.head.appendChild(s);
    } else {
      render();
    }
  }, [sitekey]);

  if (!sitekey) return null;
  return <div ref={ref} className="cf-turnstile my-1" />;
}
