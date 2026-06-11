import Link from "next/link";
import type { Locale } from "@/i18n/config";

const LABELS: Record<Locale, Record<string, string>> = {
  en: {
    home: "Home",
    about: "About",
    contact: "Contact",
    demo: "Free demo",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    cookies: "Cookie Policy",
    accessibility: "Accessibility",
    disclaimer: "Disclaimer & AI Disclosure",
    help: "If you need help, guidance, coaching or support — contact us.",
  },
  ru: {
    home: "Главная",
    about: "О платформе",
    contact: "Контакты",
    demo: "Бесплатное демо",
    privacy: "Конфиденциальность",
    terms: "Условия использования",
    cookies: "Файлы cookie",
    accessibility: "Доступность",
    disclaimer: "Дисклеймер и AI",
    help: "Нужна помощь, коучинг или поддержка — напишите нам.",
  },
  he: {
    home: "בית",
    about: "אודות",
    contact: "צור קשר",
    demo: "דמו חינם",
    privacy: "פרטיות",
    terms: "תנאי שימוש",
    cookies: "קובצי Cookie",
    accessibility: "נגישות",
    disclaimer: "הצהרה ושימוש ב-AI",
    help: "צריכים עזרה, ליווי או תמיכה — דברו איתנו.",
  },
};

const LINKS: { key: string; href: string }[] = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "demo", href: "/demo" },
  { key: "contact", href: "/contact" },
  { key: "privacy", href: "/privacy" },
  { key: "terms", href: "/terms" },
  { key: "cookies", href: "/cookies" },
  { key: "accessibility", href: "/accessibility" },
  { key: "disclaimer", href: "/disclaimer" },
];

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = LABELS[locale] ?? LABELS.en;
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-center text-sm text-soft">
          {t.help}{" "}
          <Link href="/contact" className="text-sage-deep underline-offset-2 hover:underline">
            {t.contact} →
          </Link>
        </p>
        <nav
          aria-label="Footer"
          className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2.5 text-xs text-soft"
        >
          {LINKS.map((l) => (
            <Link key={l.key} href={l.href} className="transition hover:text-ink">
              {t[l.key]}
            </Link>
          ))}
        </nav>
        <p className="mt-6 text-center text-xs text-soft/70">
          © {new Date().getFullYear()} Coach Online
        </p>
      </div>
    </footer>
  );
}
