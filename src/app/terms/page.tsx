import { LegalShell } from "@/components/legal-shell";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="June 11, 2026">
      <p>
        By using Coach Online you agree to these terms. If you do not agree, please do not use the
        Platform.
      </p>

      <h2>The service</h2>
      <p>
        Coach Online provides tools for coaching practices: scheduling, tasks, messaging, progress
        tracking, and AI-assisted coaching conversations. Coaches are independent professionals —
        they are not our employees, and we are not a party to the coaching relationship between a
        coach and their client.
      </p>

      <h2>Accounts</h2>
      <ul>
        <li>You must provide accurate information and keep your credentials secure.</li>
        <li>You are responsible for activity under your account.</li>
        <li>You must be at least 18 years old, or the age of majority in your jurisdiction.</li>
      </ul>

      <h2>Acceptable use</h2>
      <p>
        Don&apos;t misuse the Platform: no unlawful content, harassment, attempts to access other
        users&apos; data, or abuse of the AI systems (including automated scraping of the demo).
      </p>

      <h2>AI coaching</h2>
      <p>
        AI responses are generated guidance, not professional advice. See the{" "}
        <a href="/disclaimer" className="text-sage-deep underline">Disclaimer &amp; AI Disclosure</a>{" "}
        — it is part of these terms.
      </p>

      <h2>Subscriptions</h2>
      <p>
        Free and paid tiers are described on the pricing section. Paid features may change with
        notice. You can cancel anytime; access continues until the end of the billing period.
      </p>

      <h2>Liability</h2>
      <p>
        The Platform is provided &quot;as is&quot;. To the maximum extent permitted by law, we are
        not liable for indirect or consequential damages, or for outcomes of coaching decisions you
        make. Nothing here limits liability that cannot be limited by law.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms; material changes will be announced in the product. Continued use
        means acceptance.
      </p>
    </LegalShell>
  );
}
