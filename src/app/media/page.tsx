import { LegalShell } from "@/components/legal-shell";
import { InquiryForm } from "@/components/inquiry-form";
import { SocialLinks } from "@/components/social-links";
import { FOUNDER } from "@/lib/founder";

export const metadata = { title: "Media & Podcasts" };

export default function MediaPage() {
  return (
    <LegalShell title="Media & Podcasts">
      <p>
        Journalists, podcast hosts and content creators — {FOUNDER.name} is available for
        interviews, podcast appearances and content collaborations in English, Russian and Hebrew.
        Topics: coaching practice, AI in personal development, wellness, building a coaching
        platform.
      </p>

      <h2>Verify and follow</h2>
      <p>
        Public presence:{" "}
        <a href={FOUNDER.website} target="_blank" rel="noopener noreferrer" className="text-sage-deep underline">
          svarga-om.com
        </a>{" "}
        and the channels below.
      </p>
      <SocialLinks className="mt-2 flex flex-wrap items-center gap-2" />

      <h2>Media inquiry</h2>
      <InquiryForm
        email={FOUNDER.email}
        subjectPrefix="Media"
        subjects={[
          "Podcast invitation",
          "Interview request",
          "Media request",
          "Content collaboration",
        ]}
      />
    </LegalShell>
  );
}
