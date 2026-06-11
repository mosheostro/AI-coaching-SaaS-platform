import { LegalShell } from "@/components/legal-shell";

export const metadata = { title: "Disclaimer & AI Disclosure" };

export default function DisclaimerPage() {
  return (
    <LegalShell title="Disclaimer & AI Usage Disclosure" updated="June 11, 2026">
      <h2>AI-generated guidance</h2>
      <p>
        The AI Coach and the public demo produce machine-generated responses (the full AI coach
        uses Anthropic&apos;s Claude models; the instant demo uses a structured, deterministic
        coaching engine). Conversations may feel personal and insightful — but they are generated
        guidance, not the judgment of a licensed professional.
      </p>

      <h2>What AI coaching is not</h2>
      <ul>
        <li>It is <strong>not therapy, medical care, psychiatric treatment or diagnosis</strong>.</li>
        <li>It is <strong>not legal or financial advice</strong>.</li>
        <li>It does not replace a qualified human professional where one is needed.</li>
      </ul>

      <h2>Limitations</h2>
      <p>
        AI systems can be wrong, overly generic, or miss important context. Insights, patterns and
        action plans are suggestions to consider — verify anything consequential and apply your own
        judgment. The AI&apos;s &quot;memory&quot; reflects what you told it, not an objective
        assessment of you.
      </p>

      <h2>Your responsibilities</h2>
      <ul>
        <li>Use the platform as a reflection and accountability tool, not as a substitute for professional care.</li>
        <li>If you are in crisis or considering harming yourself, stop using the app and contact local emergency services or a crisis line immediately.</li>
        <li>Decisions you make based on coaching conversations — human or AI — remain your own.</li>
      </ul>

      <h2>Human coaches</h2>
      <p>
        Coaches on the platform are independent practitioners. Verify a coach&apos;s qualifications
        directly with them; we do not certify or license coaches.
      </p>
    </LegalShell>
  );
}
