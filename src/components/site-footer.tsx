import Link from "next/link";
import { SocialLinks } from "@/components/social-links";
import { FOUNDER } from "@/lib/founder";
import type { Locale } from "@/i18n/config";

const LABELS: Record<Locale, Record<string, string>> = {
  en: {
    home: "Home",
    about: "About",
    demo: "Free demo",
    contact: "Contact",
    support: "Support",
    partnerships: "Partnerships",
    media: "Media & Podcasts",
    speaking: "Speaking & Events",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    cookies: "Cookie Policy",
    accessibility: "Accessibility",
    disclaimer: "Disclaimer & AI Disclosure",
    help: "If you need help, guidance, coaching or support — contact us.",
    card: "",
    platform: "Platform",
    connect: "Connect",
    legal: "Legal",
  },
  ru: {
    home: "Главная",
    about: "О платформе",
    demo: "Бесплатное демо",
    contact: "Контакты",
    support: "Поддержка",
    partnerships: "Партнёрство",
    media: "Медиа и подкасты",
    speaking: "Выступления",
    privacy: "Конфиденциальность",
    terms: "Условия использования",
    cookies: "Файлы cookie",
    accessibility: "Доступность",
    disclaimer: "Дисклеймер и AI",
    help: "Нужна помощь, коучинг или поддержка — напишите нам.",
    card: "Цифровая визитка",
    platform: "Платформа",
    connect: "Связаться",
    legal: "Документы",
  },
  he: {
    home: "בית",
    about: "אודות",
    demo: "דמו חינם",
    contact: "צור קשר",
    support: "תמיכה",
    partnerships: "שותפויות",
    media: "מדיה ופודקאסטים",
    speaking: "הרצאות ואירועים",
    privacy: "פרטיות",
    terms: "תנאי שימוש",
    cookies: "קובצי Cookie",
    accessibility: "נגישות",
    disclaimer: "הצהרה ושימוש ב-AI",
    help: "צריכים עזרה, ליווי או תמיכה — דברו איתנו.",
    card: "כרטיס ביקור דיגיטלי",
    platform: "פלטפורמה",
    connect: "יצירת קשר",
    legal: "מסמכים",
  },
};

const PLATFORM_LINKS = ["home", "about", "demo"] as const;
const CONNECT_LINKS = ["contact", "support", "partnerships", "media", "speaking"] as const;
const LEGAL_LINKS = ["privacy", "terms", "cookies", "accessibility", "disclaimer"] as const;

const HREFS: Record<string, string> = {
  home: "/",
  about: "/about",
  demo: "/demo",
  contact: "/contact",
  support: "/support",
  partnerships: "/partnerships",
  media: "/media",
  speaking: "/speaking",
  privacy: "/privacy",
  terms: "/terms",
  cookies: "/cookies",
  accessibility: "/accessibility",
  disclaimer: "/disclaimer",
};

function Column({
  title,
  keys,
  t,
}: {
  title: string;
  keys: readonly string[];
  t: Record<string, string>;
}) {
  return (
    <nav aria-label={title}>
      <p className="text-xs font-semibold uppercase tracking-wide text-soft">{title}</p>
      <ul className="mt-3 space-y-2 text-sm">
        {keys.map((k) => (
          <li key={k}>
            <Link href={HREFS[k]} className="text-soft transition hover:text-ink">
              {t[k]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = LABELS[locale] ?? LABELS.en;
  const card = FOUNDER.businessCard[locale];

  return (
    <footer className="border-t border-line bg-canvas2/40">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-heading text-lg font-semibold">Coach Online</p>
            <p className="mt-2 text-sm leading-relaxed text-soft">{t.help}</p>
            <SocialLinks className="mt-4 flex flex-wrap items-center gap-2" />
          </div>
          <Column title={t.platform} keys={PLATFORM_LINKS} t={t} />
          <Column title={t.connect} keys={CONNECT_LINKS} t={t} />
          <Column title={t.legal} keys={LEGAL_LINKS} t={t} />
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-line/60 pt-6 text-center text-xs text-soft sm:flex-row sm:justify-between sm:text-start">
          <p>
            © {new Date().getFullYear()} Coach Online · {FOUNDER.name}
          </p>
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <a href={`mailto:${FOUNDER.email}`} className="transition hover:text-ink">
              {FOUNDER.email}
            </a>
            <span aria-hidden>·</span>
            <a
              href={FOUNDER.website}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-ink"
            >
              svarga-om.com
            </a>
            {card && (
              <>
                <span aria-hidden>·</span>
                <a
                  href={card}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-ink"
                >
                  {t.card}
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
