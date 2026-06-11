import { LegalShell } from "@/components/legal-shell";
import { InquiryForm } from "@/components/inquiry-form";
import { SocialLinks } from "@/components/social-links";
import { FOUNDER } from "@/lib/founder";
import { getLocale } from "@/i18n";

export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const locale = await getLocale();
  const card = FOUNDER.businessCard[locale];

  return (
    <LegalShell title="Contact">
      <p>
        Coach Online is built and run by <strong>{FOUNDER.name}</strong> — coach and wellness
        practitioner working with an international audience in English, Russian and Hebrew. If you
        need help, guidance, coaching, or support — feel free to contact us directly.
      </p>

      <div className="card mt-2 grid gap-4 p-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-soft">Email</p>
          <a href={`mailto:${FOUNDER.email}`} className="text-sage-deep underline">
            {FOUNDER.email}
          </a>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-soft">Phone</p>
          <a href={`tel:${FOUNDER.phoneHref}`} className="text-sage-deep underline">
            {FOUNDER.phone}
          </a>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-soft">Website</p>
          <a href={FOUNDER.website} target="_blank" rel="noopener noreferrer" className="text-sage-deep underline">
            svarga-om.com
          </a>
          {card && (
            <>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-soft">
                {locale === "ru" ? "Цифровая визитка" : "כרטיס ביקור דיגיטלי"}
              </p>
              <a href={card} target="_blank" rel="noopener noreferrer" className="text-sage-deep underline">
                {locale === "ru" ? "Открыть визитку" : "לפתוח כרטיס ביקור"}
              </a>
            </>
          )}
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-soft">Social</p>
          <SocialLinks className="flex flex-wrap items-center gap-2" />
          <a
            href={FOUNDER.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary mt-4 w-full"
          >
            Join the Telegram community
          </a>
        </div>
      </div>

      <h2>Write to us</h2>
      <p>
        Coaching inquiries, support questions, business matters — pick a subject and send your
        message right here. It goes straight to {FOUNDER.name.split(" ")[0]}&apos;s inbox.
      </p>
      <InquiryForm
        email={FOUNDER.email}
        subjectPrefix="Coach Online"
        subjects={[
          "Coaching inquiry",
          "Support request",
          "Question about the platform",
          "Business inquiry",
          "Other",
        ]}
      />
    </LegalShell>
  );
}
