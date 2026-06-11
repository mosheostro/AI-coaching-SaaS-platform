import { LegalShell } from "@/components/legal-shell";

export const metadata = { title: "Cookie Policy" };

export default function CookiesPage() {
  return (
    <LegalShell title="Cookie Policy" updated="June 11, 2026">
      <p>
        Coach Online uses a minimal, functional set of cookies and browser storage. We do not use
        advertising or cross-site tracking cookies.
      </p>

      <h2>What we store</h2>
      <ul>
        <li><strong>Authentication cookies</strong> (Supabase) — keep you signed in securely. Essential.</li>
        <li><strong><code>locale</code> cookie</strong> — remembers your language (English / Русский / עברית). Functional.</li>
        <li><strong><code>theme</code> in localStorage</strong> — remembers your theme choice. Functional.</li>
        <li><strong>Demo session in localStorage</strong> — lets you resume the free demo session on your own device. Never sent to our servers.</li>
      </ul>

      <h2>Managing cookies</h2>
      <p>
        You can clear cookies and site data in your browser settings at any time. Blocking
        essential cookies will prevent sign-in from working.
      </p>
    </LegalShell>
  );
}
