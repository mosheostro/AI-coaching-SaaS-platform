"use client";

import { useEffect, useState } from "react";

type Status = "idle" | "sending" | "sent" | "mailto";

function rnd() {
  return 1 + Math.floor(Math.random() * 9);
}

export function InquiryForm({
  email,
  subjectPrefix,
  subjects,
}: {
  email: string;
  subjectPrefix: string;
  subjects?: string[];
}) {
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [subject, setSubject] = useState(subjects?.[0] ?? "");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [human, setHuman] = useState(false);
  const [capA, setCapA] = useState(0);
  const [capB, setCapB] = useState(0);
  const [capAnswer, setCapAnswer] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    setCapA(rnd());
    setCapB(rnd());
  }, []);

  function regenCaptcha() {
    setCapA(rnd());
    setCapB(rnd());
    setCapAnswer("");
  }

  function openMailApp() {
    // Instant sending unavailable — fall back to the visitor's mail app,
    // pre-filled with the message (the original, always-working flow).
    const su = encodeURIComponent(`[${subjectPrefix}] ${subject || "Inquiry"}${name ? ` — ${name}` : ""}`);
    const body = encodeURIComponent(`${message}\n\n—\nFrom: ${name}${from ? ` <${from}>` : ""}`);
    window.location.href = `mailto:${email}?subject=${su}&body=${body}`;
    setStatus("mailto");
    regenCaptcha();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: from,
          subject,
          message,
          page: subjectPrefix,
          website,
          human,
          captchaA: capA,
          captchaB: capB,
          captchaAnswer: Number(capAnswer),
        }),
      });
      if (res.ok) {
        setStatus("sent");
      } else {
        openMailApp();
      }
    } catch {
      openMailApp();
    }
  }

  if (status === "sent") {
    return (
      <div className="card mt-4 p-8 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-sage/15 text-xl text-sage-deep">
          ✓
        </span>
        <p className="mt-4 text-lg font-semibold">Message sent</p>
        <p className="mt-1.5 text-sm text-soft">
          Thank you, {name.split(" ")[0] || "friend"} — we&apos;ll reply to{" "}
          <span className="text-ink">{from}</span> as soon as possible.
        </p>
        <button
          onClick={() => {
            setStatus("idle");
            setMessage("");
            setHuman(false);
            regenCaptcha();
          }}
          className="btn-secondary mt-5"
        >
          Send another message
        </button>
      </div>
    );
  }

  if (status === "mailto") {
    return (
      <div className="card mt-4 p-8 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-xl text-gold">
          ✉
        </span>
        <p className="mt-4 text-lg font-semibold">Almost there</p>
        <p className="mt-1.5 text-sm text-soft">
          Your email app should now be open with the message ready — just press Send there.
          Nothing opened? Write directly to{" "}
          <a href={`mailto:${email}`} className="text-sage-deep underline">
            {email}
          </a>
        </p>
        <button onClick={() => setStatus("idle")} className="btn-secondary mt-5">
          Back to the form
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card mt-4 space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="iq-name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <input
            id="iq-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input"
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="iq-email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="iq-email"
            type="email"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            required
            className="input"
            autoComplete="email"
          />
        </div>
      </div>

      <div className="absolute -left-[9999px] top-auto" aria-hidden="true">
        <label htmlFor="iq-website">Website</label>
        <input
          id="iq-website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="iq-subject" className="mb-1 block text-sm font-medium">
          Subject
        </label>
        {subjects ? (
          <select
            id="iq-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="input"
          >
            {subjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        ) : (
          <input
            id="iq-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="input"
          />
        )}
      </div>
      <div>
        <label htmlFor="iq-message" className="mb-1 block text-sm font-medium">
          Message
        </label>
        <textarea
          id="iq-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          required
          className="input"
        />
      </div>

      <div className="grid gap-3 rounded-xl border border-line bg-canvas2/50 p-4 sm:grid-cols-2 sm:items-center">
        <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={human}
            onChange={(e) => setHuman(e.target.checked)}
            required
            className="h-5 w-5 accent-[rgb(var(--c-accent-deep))]"
          />
          <span className="text-sm font-medium">I&apos;m not a robot</span>
        </label>
        <div className="flex items-center gap-2">
          <label htmlFor="iq-captcha" className="whitespace-nowrap text-sm text-soft">
            {capA} + {capB} =
          </label>
          <input
            id="iq-captcha"
            inputMode="numeric"
            pattern="[0-9]*"
            value={capAnswer}
            onChange={(e) => setCapAnswer(e.target.value)}
            required
            aria-label={`Captcha: what is ${capA} plus ${capB}?`}
            className="input max-w-[90px]"
          />
        </div>
      </div>

      <button type="submit" disabled={status === "sending"} className="btn-primary w-full sm:w-auto">
        {status === "sending" ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-canvas/40 border-t-canvas" />
            Sending…
          </span>
        ) : (
          "Send message"
        )}
      </button>
    </form>
  );
}
