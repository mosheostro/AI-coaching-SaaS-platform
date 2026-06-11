import { LegalShell } from "@/components/legal-shell";
import { InquiryForm } from "@/components/inquiry-form";
import { FOUNDER } from "@/lib/founder";

export const metadata = { title: "Speaking & Events" };

const FORMATS = [
  "Conferences",
  "Webinars",
  "Workshops",
  "Corporate events",
  "Wellness events",
  "Educational events",
  "Podcasts",
];

export default function SpeakingPage() {
  return (
    <LegalShell title="Speaking & Events">
      <p>
        {FOUNDER.name} speaks about coaching, personal transformation, wellness practice and
        building with AI — in English, Russian and Hebrew, on stage or online. Sessions are
        practical and grounded: real frameworks, real client patterns, no fluff.
      </p>

      <h2>Invite for</h2>
      <ul>
        {FORMATS.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      <h2>Booking inquiry</h2>
      <p>
        Include the date, format, audience and topic you have in mind — you&apos;ll get a response
        with availability and details.
      </p>
      <InquiryForm
        email={FOUNDER.email}
        subjectPrefix="Speaking"
        subjects={FORMATS.map((f) => `${f} invitation`)}
      />
      <p>
        Prefer email? Write directly to{" "}
        <a href={`mailto:${FOUNDER.email}`} className="text-sage-deep underline">
          {FOUNDER.email}
        </a>
        .
      </p>
    </LegalShell>
  );
}
