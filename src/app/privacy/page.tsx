import { LegalShell } from "@/components/legal-shell";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="June 11, 2026">
      <p>
        Coach Online (&quot;the Platform&quot;, &quot;we&quot;) helps coaches and clients work
        together: sessions, growth tasks, messaging, progress tracking and an AI coaching
        companion. This policy explains what we collect, why, and your choices. Legal pages are
        provided in English.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account data</strong> — name, email, role (coach or client), language preference.</li>
        <li><strong>Practice data</strong> — sessions, tasks, submissions, messages, progress metrics you or your coach create.</li>
        <li><strong>AI coaching data</strong> — your AI conversations and the structured memories derived from them (goals, commitments, themes). These are visible only to you.</li>
        <li><strong>Technical data</strong> — basic logs needed to operate and secure the service.</li>
      </ul>

      <h2>How data is processed</h2>
      <p>
        Data is stored with Supabase (Postgres) protected by row-level security: a coach can access
        only their clients&apos; records; a client only their own; AI coach data is strictly
        per-user. AI conversations are processed by Anthropic&apos;s Claude API to generate
        responses; the anonymous public demo is not persisted server-side at all.
      </p>

      <h2>What we don&apos;t do</h2>
      <ul>
        <li>We do not sell personal data.</li>
        <li>We do not use your coaching conversations for advertising.</li>
        <li>We do not share data with third parties beyond the processors named above.</li>
      </ul>

      <h2>Your rights</h2>
      <p>
        You may request access, correction, export or deletion of your data at any time via the{" "}
        <a href="/contact" className="text-sage-deep underline">contact page</a>. Deleting your
        account removes your profile and cascades to your records.
      </p>

      <h2>Data processing summary</h2>
      <p>
        Controller: the platform operator (see Contact). Processors: Supabase (database, auth,
        storage), Vercel (hosting), Anthropic (AI responses). Data location: processor-managed
        cloud infrastructure. Retention: for the life of your account, or until you request
        deletion.
      </p>
    </LegalShell>
  );
}
