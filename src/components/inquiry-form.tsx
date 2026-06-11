"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Shared inquiry form — sends directly from the site via /api/contact
 * (no email client needed). Falls back to a direct mailto link on failure.
 */
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
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError("");

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
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus("sent");
      } else {
        setError(data.error ?? "Could not send.");
        setStatus("error");
      }
    } catch {
      setError("Network error.");
      setStatus("error");
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
          }}
          className="btn-secondary mt-5"
        >
          Send another message
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

      {/* Honeypot — hidden from humans, irresistible to bots */}
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

      {status === "error" && (
        <p className="text-sm text-red-500">
          {error}{" "}
          <a href={`mailto:${email}`} className="underline">
            Email us directly: {email}
          </a>
        </p>
      )}

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
