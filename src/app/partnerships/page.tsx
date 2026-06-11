import { LegalShell } from "@/components/legal-shell";
import { InquiryForm } from "@/components/inquiry-form";
import { FOUNDER } from "@/lib/founder";

export const metadata = { title: "Partnerships" };

const AREAS = [
  ["Business partnerships", "Distribution, co-marketing, white-label discussions."],
  ["Affiliate opportunities", "Promote Coach Online to your audience."],
  ["Joint ventures", "Build a program or product together."],
  ["Wellness collaborations", "Retreats, studios, wellness brands."],
  ["Coaching collaborations", "Coach networks, supervision circles, group programs."],
  ["Educational collaborations", "Courses, academies, certification bodies."],
  ["Technology partnerships", "Integrations and platform partnerships."],
];

export default function PartnershipsPage() {
  return (
    <LegalShell title="Partnerships">
      <p>
        Coach Online grows through partners. If your audience or product touches coaching, wellness
        or personal development, we&apos;d like to hear from you — concrete proposals get the
        fastest answers.
      </p>

      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {AREAS.map(([t, d]) => (
          <div key={t} className="card p-5">
            <h2 className="!mt-0 text-base font-semibold">{t}</h2>
            <p className="mt-1 text-sm text-soft">{d}</p>
          </div>
        ))}
      </div>

      <h2>Partnership inquiry</h2>
      <InquiryForm
        email={FOUNDER.email}
        subjectPrefix="Partnership"
        subjects={[
          "Business partnership",
          "Affiliate opportunity",
          "Joint venture",
          "Wellness collaboration",
          "Coaching collaboration",
          "Educational collaboration",
          "Technology partnership",
        ]}
      />
    </LegalShell>
  );
}
