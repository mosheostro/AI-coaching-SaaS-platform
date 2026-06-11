import Link from "next/link";
import { SocialLinks } from "@/components/social-links";
import { FOUNDER } from "@/lib/founder";
import type { Locale } from "@/i18n/config";

const COPY: Record<
  Locale,
  { eyebrow: string; title: string; body: string; book: string; community: string; card?: string }
> = {
  en: {
    eyebrow: "Meet the founder",
    title: "Built by a working coach — not a software committee",
    body: "Coach Online is created and led by Moshe Ostrovsky, a coach and wellness practitioner serving an international audience in English, Russian and Hebrew. The platform reflects years of real practice in coaching, personal development and wellness — every feature exists because real sessions needed it.",
    book: "Book a conversation",
    community: "Join the community",
  },
  ru: {
    eyebrow: "Основатель платформы",
    title: "Создано практикующим коучем — не комитетом разработчиков",
    body: "Coach Online создаёт и ведёт Моше Островский — коуч и wellness-практик, работающий с международной аудиторией на русском, английском и иврите. Платформа выросла из многолетней реальной практики коучинга, личностного развития и wellness — каждая функция появилась потому, что была нужна в настоящих сессиях.",
    book: "Записаться на разговор",
    community: "Вступить в сообщество",
    card: "Цифровая визитка",
  },
  he: {
    eyebrow: "מאחורי הפלטפורמה",
    title: "נבנה על ידי מאמן מתרגל — לא ועדת תוכנה",
    body: "את Coach Online יצר ומוביל משה אוסטרובסקי — מאמן ומלווה wellness שעובד עם קהל בינלאומי בעברית, רוסית ואנגלית. הפלטפורמה צמחה משנים של פרקטיקה אמיתית באימון, התפתחות אישית ו-wellness — כל פיצ'ר קיים כי מפגשים אמיתיים היו צריכים אותו.",
    book: "לקבוע שיחה",
    community: "להצטרף לקהילה",
    card: "כרטיס ביקור דיגיטלי",
  },
};

export function FounderSection({ locale }: { locale: Locale }) {
  const t = COPY[locale] ?? COPY.en;
  const card = FOUNDER.businessCard[locale];

  return (
    <section className="bg-canvas2/60 py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="card relative overflow-hidden p-8 md:p-12">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold md:text-3xl">{t.title}</h2>
          <p className="mt-4 leading-relaxed text-soft">{t.body}</p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/contact" className="btn-primary">
              {t.book}
            </Link>
            <a
              href={FOUNDER.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              {t.community}
            </a>
            {card && t.card && (
              <a
                href={card}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                {t.card}
              </a>
            )}
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-line/60 pt-6">
            <SocialLinks />
            <a
              href={FOUNDER.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-soft transition hover:text-ink"
            >
              svarga-om.com ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
