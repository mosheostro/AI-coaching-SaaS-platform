import { LegalShell } from "@/components/legal-shell";

export const metadata = { title: "Accessibility Statement" };

export default function AccessibilityPage() {
  return (
    <LegalShell title="Accessibility Statement" updated="June 11, 2026">
      <p>
        We want Coach Online to be usable by everyone. The platform targets WCAG 2.1 AA and is
        built with accessibility as a design constraint, not an afterthought.
      </p>

      <h2>What is implemented</h2>
      <ul>
        <li>Full keyboard operability: visible focus rings, real buttons and form controls, a skip-to-content link.</li>
        <li>Semantic structure: landmarks, heading hierarchy, <code>aria-current</code> navigation state, <code>aria-expanded</code> on disclosure controls, labels on all inputs and icon buttons.</li>
        <li>Touch targets of at least 44px throughout.</li>
        <li><code>prefers-reduced-motion</code> respected — ambient animation is disabled for users who request it.</li>
        <li>Light, dark and high-legibility (Minimal) themes; system preference supported.</li>
        <li>Three interface languages with full right-to-left support for Hebrew.</li>
      </ul>

      <h2>Known limitations</h2>
      <ul>
        <li>A formal screen-reader audit (NVDA / VoiceOver) is still scheduled.</li>
        <li>Some gold accent text at small sizes may fall slightly below AA contrast in the light theme.</li>
      </ul>

      <h2>Feedback</h2>
      <p>
        If you encounter an accessibility barrier, please tell us via the{" "}
        <a href="/contact" className="text-sage-deep underline">contact page</a> — we treat such
        reports as priority fixes.
      </p>
    </LegalShell>
  );
}
