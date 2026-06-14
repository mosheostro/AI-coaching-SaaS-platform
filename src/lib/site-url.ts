import { headers } from "next/headers";

/**
 * Absolute origin for building auth redirect links (email confirm / reset).
 * Prefers the request's real host (works on Vercel previews + custom domains),
 * falls back to NEXT_PUBLIC_SITE_URL, then localhost.
 */
export async function getOrigin(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "https";
    if (host) return `${proto}://${host}`;
  } catch {
    // headers() unavailable outside a request scope
  }
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export function clientIp(h: Headers): string {
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
