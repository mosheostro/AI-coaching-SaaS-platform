import { LegalShell } from "@/components/legal-shell";
import { ContactForm } from "./contact-form";

export const metadata = { title: "Contact" };

const CONTACT_EMAIL = "mosheostro@gmail.com";

export default function ContactPage() {
  return (
    <LegalShell title="Contact us">
      <p>
        If you need help, guidance, coaching, or support — feel free to contact us. We read every
        message: support questions, coaching inquiries, partnership ideas, accessibility reports.
      </p>
      <p>
        Email us directly at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-sage-deep underline">
          {CONTACT_EMAIL}
        </a>{" "}
        or use the form below — it opens a pre-filled message in your email app.
      </p>
      <ContactForm email={CONTACT_EMAIL} />
    </LegalShell>
  );
}
