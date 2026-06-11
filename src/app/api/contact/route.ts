import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

async function sendResend(subject: string, text: string, replyTo: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM ?? "Coach Online <onboarding@resend.dev>",
        to: [TO_EMAIL],
        reply_to: replyTo,
        subject,
        text,
      }),
    });
    if (r.ok) return true;
    console.error("Resend failed:", r.status, (await r.text()).slice(0, 300));
  } catch (e) {
    console.error("Resend error:", e);
  }
  return false;
}

async function sendFormSubmit(
  name: string,
  from: string,
  subject: string,
  text: string
): Promise<boolean> {
  try {
    const r = await fetch(`https://formsubmit.co/ajax/${TO_EMAIL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name,
        email: from,
        _subject: subject,
        message: text,
        _template: "table",
        _captcha: "false",
      }),
    });
    const data = (await r.json().catch(() => ({}))) as { success?: string | boolean; message?: string };
    const ok = r.ok && (data.success === true || data.success === "true");
    if (!ok) console.error("FormSubmit failed:", r.status, JSON.stringify(data).slice(0, 300));
    return ok;
  } catch (e) {
    console.error("FormSubmit error:", e);
    return false;
  }
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

  // Honeypot
  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  // Human verification: checkbox + arithmetic captcha
  if (body.human !== true) {
    return NextResponse.json(
      { error: 'Please confirm "I\'m not a robot".' },
      { status: 400 }
    );
  }
  const a = Number(body.captchaA);
  const b = Number(body.captchaB);
  const answer = Number(body.captchaAnswer);
  if (
    !Number.isInteger(a) || !Number.isInteger(b) || !Number.isInteger(answer) ||
    a < 1 || a > 20 || b < 1 || b > 20 || a + b !== answer
  ) {
    return NextResponse.json({ error: "Captcha answer is incorrect." }, { status: 400 });
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
  const text = `${message}\n\n—\nFrom: ${name} <${from}>\nPage: ${page || "contact"}`;

  // 1) Try email providers
  let delivered = await sendResend(fullSubject, text, from);
  if (!delivered) {
    delivered = await sendFormSubmit(name, from, fullSubject, text);
  }

  // 2) Always store in the database so no inquiry is ever lost
  let stored = false;
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("contact_messages").insert({
      name,
      email: from,
      subject,
      message,
      page,
      delivered,
    });
    stored = !error;
    if (error) console.error("DB store failed:", error.message);
  } catch (e) {
    console.error("DB store error:", e);
  }

  if (delivered || stored) {
    return NextResponse.json({ ok: true, delivered, stored });
  }

  return NextResponse.json(
    { error: "Could not send right now. Please email us directly.", fallback: TO_EMAIL },
    { status: 502 }
  );
}
