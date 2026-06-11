import Link from "next/link";
import { LegalShell } from "@/components/legal-shell";
import { InquiryForm } from "@/components/inquiry-form";
import { FOUNDER } from "@/lib/founder";

export const metadata = { title: "Support" };

export default function SupportPage() {
  return (
    <LegalShell title="Support">
      <p>
        Something not working? A question about your account, sessions, the AI coach, billing or
        languages? We&apos;ll help. Most messages get a reply within one business day.
      </p>

      <h2>Quick answers</h2>
      <ul>
        <li>
          <strong>Can&apos;t sign in?</strong> Check the confirmation email from your signup; also
          see the <Link href="/cookies" className="text-sage-deep underline">cookie policy</Link> —
          essential cookies must be allowed.
        </li>
        <li>
          <strong>AI coach unavailable?</strong> The free demo at{" "}
          <Link href="/demo" className="text-sage-deep underline">/demo</Link> always works; the
          full AI coach requires an active account.
        </li>
        <li>
          <strong>Data questions?</strong> See the{" "}
          <Link href="/privacy" className="text-sage-deep underline">privacy policy</Link> or ask
          below.
        </li>
      </ul>

      <h2>Contact support</h2>
      <p>
        Use the form, or email{" "}
        <a href={`mailto:${FOUNDER.email}`} className="text-sage-deep underline">
          {FOUNDER.email}
        </a>{" "}
        / call{" "}
        <a href={`tel:${FOUNDER.phoneHref}`} className="text-sage-deep underline">
          {FOUNDER.phone}
        </a>
        .
      </p>
      <InquiryForm
        email={FOUNDER.email}
        subjectPrefix="Support"
        subjects={[
          "Report an issue",
          "Account help",
          "Platform question",
          "Billing question",
          "Accessibility issue",
        ]}
      />
    </LegalShell>
  );
}
