"use client";

import { useState } from "react";

const TOPICS = ["Support", "Coaching inquiry", "Question", "Accessibility", "Other"];

export function ContactForm({ email }: { email: string }) {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`[Coach Online] ${topic}${name ? ` — ${name}` : ""}`);
    const body = encodeURIComponent(message);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={submit} className="card mt-4 space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="mb-1 block text-sm font-medium">
            Your name
          </label>
          <input
            id="c-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="c-topic" className="mb-1 block text-sm font-medium">
            Topic
          </label>
          <select
            id="c-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="input"
          >
            {TOPICS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="c-message" className="mb-1 block text-sm font-medium">
          Message
        </label>
        <textarea
          id="c-message"
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
