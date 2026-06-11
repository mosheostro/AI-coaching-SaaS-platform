"use client";

import { useState } from "react";

/**
 * Shared inquiry form. Opens the visitor's email client with a
 * pre-filled message (no email backend required), then shows a
 * success state with a direct-email fallback.
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
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const s = encodeURIComponent(
      `[${subjectPrefix}] ${subject || "Inquiry"}${name ? ` — ${name}` : ""}`
    );
    const body = encodeURIComponent(
      `${message}\n\n—\nFrom: ${name}${from ? ` <${from}>` : ""}`
    );
    window.location.href = `mailto:${email}?subject=${s}&body=${body}`;
    setSent(true);
  }

  if (sent) {
    return (
      <div className="card mt-4 p-6 text-center">
        <span className="text-2xl text-sage">✓</span>
        <p className="mt-2 font-medium">Your email app should now be open with the message ready to send.</p>
        <p className="mt-2 text-sm text-soft">
          Nothing happened? Email directly:{" "}
          <a href={`mailto:${email}`} className="text-sage-deep underline">
            {email}
          </a>
        </p>
        <button onClick={() => setSent(false)} className="btn-secondary mt-4">
          Edit message
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
      <button type="submit" className="btn-primary">
        Send message
      </button>
    </form>
  );
}
