import Link from "next/link";
import { LegalShell } from "@/components/legal-shell";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <LegalShell title="About Coach Online">
      <p>
        Coach Online is a personal transformation platform where human coaches and AI work
        together. Coaches run their entire practice here — sessions, growth tasks, private
        messaging, progress tracking — and every client gets an always-available AI coaching
        companion that remembers their goals and commitments between sessions.
      </p>

      <h2>Who it&apos;s for</h2>
      <ul>
        <li><strong>Coaches</strong> — life, executive, wellness and leadership coaches who want one calm, premium workspace instead of five scattered tools.</li>
        <li><strong>Clients</strong> — people committed to real change who want structure, accountability and visible progress.</li>
        <li><strong>Curious visitors</strong> — anyone can try a full coaching session free, instantly, with no account.</li>
      </ul>

      <h2>How we treat your data</h2>
      <p>
        Every record is isolated with row-level security: your coach sees only your shared work,
        and your AI conversations are visible to you alone. Read the{" "}
        <Link href="/privacy" className="text-sage-deep underline">Privacy Policy</Link> for
        details.
      </p>

      <h2>Try it now</h2>
      <p>
        <Link href="/demo" className="text-sage-deep underline">Start a free coaching session</Link>{" "}
        — under three minutes to your first real insight. Questions?{" "}
        <Link href="/contact" className="text-sage-deep underline">Contact us</Link>.
      </p>
    </LegalShell>
  );
}
