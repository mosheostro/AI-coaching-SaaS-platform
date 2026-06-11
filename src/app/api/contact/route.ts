import { NextResponse } from "next/server";
import { FOUNDER } from "@/lib/founder";

export const maxDuration = 30;

const TO_EMAIL = process.env.CONTACT_EMAIL ?? FOUNDER.email;

// Best-effort per-instance rate limit
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 8;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_REQUESTS) return true;
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return false;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(v: unknown, max: number): string {
  return typeof v === "string" ? v.replace(/[\r\n]+/g, " ").trim().slice(0, max) : "";
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many messages. Please try again later." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot: bots fill every field; humans never see this one.
  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ ok: true }); // silently drop
  }

  const name = clean(body.name, 120);
  const from = clean(body.email, 200);
  const subject = clean(body.subject, 160);
  const page = clean(body.page, 60);
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 5000) : "";

  if (!name || !message || !EMAIL_RE.test(from)) {
    return NextResponse.json({ error: "Please fill all fields correctly." }, { status: 400 });
  }

  const fullSubject = `[Coach Online${page ? ` · ${page}` : ""}] ${subject || "Inquiry"} — ${name}`;
  const text = `${message}\n\n—\nFrom: ${name} <${from}>\nPage: ${page || "contact"}\nIP: ${ip}`;

  // Provider 1: Resend (set RESEND_API_KEY in env for production-grade delivery)
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM ?? "Coach Online <onboarding@resend.dev>",
        to: [TO_EMAIL],
        reply_to: from,
        subject: fullSubject,
        text,
      }),
    });
    if (r.ok) return NextResponse.json({ ok: true });
    const detail = await r.text();
    console.error("Resend failed:", r.status, detail.slice(0, 300));
    // fall through to backup provider
  }

  // Provider 2: FormSubmit (no key required; one-time email activation on first use)
  try {
    const r = await fetch(`https://formsubmit.co/ajax/${TO_EMAIL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name,
        email: from,
        _subject: fullSubject,
        message: text,
        _template: "table",
        _captcha: "false",
      }),
    });
    if (r.ok) return NextResponse.json({ ok: true });
    const detail = await r.text();
    console.error("FormSubmit failed:", r.status, detail.slice(0, 300));
  } catch (e) {
    console.error("FormSubmit error:", e);
  }

  return NextResponse.json(
    { error: "Could not send right now. Please email us directly.", fallback: TO_EMAIL },
    { status: 502 }
  );
}
