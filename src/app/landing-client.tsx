"use client";

import Link from "next/link";
import { useState } from "react";
import { Aurora } from "@/components/aurora";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { FadeIn, Stagger, StaggerItem, Counter, motion } from "@/components/motion";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";

type Landing = Dictionary["landing"];

const FEATURE_ICONS = ["◷", "✎", "✦", "↗", "⟁", "◐"];

export function LandingClient({
  t,
  appName,
  locale,
}: {
  t: Landing;
  appName: string;
  locale: Locale;
}) {
  return (
    <main className="min-h-screen">
      {/* ============ Header ============ */}
      <header className="sticky top-0 z-40 glass">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3.5 sm:px-6">
          <span className="shrink-0 font-heading text-lg font-semibold">{appName}</span>
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="hidden sm:block">
              <LocaleSwitcher current={locale} />
            </span>
            <ThemeToggle />
            <Link href="/login" className="btn-secondary hidden sm:inline-flex">
              {t.ctaSecondary}
            </Link>
            <Link href="/signup" className="btn-primary whitespace-nowrap">
              {t.cta}
            </Link>
          </div>
        </div>
      </header>

      {/* ============ 1 · Hero ============ */}
      <section className="mesh-bg relative">
        <Aurora className="absolute inset-0 h-full w-full opacity-70" />
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 pb-28 pt-24 text-center md:pt-32">
          <FadeIn>
            <p className="eyebrow">{t.heroEyebrow}</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] sm:text-5xl md:text-7xl">
              <span className="text-gradient">{t.hero}</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.22}>
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-soft md:text-lg">
              {t.sub}
            </p>
          </FadeIn>
          <FadeIn delay={0.34}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
              <Link href="/signup" className="btn-primary px-8 py-3.5 text-base ring-glow">
                {t.cta}
              </Link>
              <Link href="/login" className="btn-secondary px-8 py-3.5 text-base">
                {t.ctaSecondary}
              </Link>
            </div>
            <p className="mt-5 text-xs text-soft">{t.heroNote}</p>
          </FadeIn>

          {/* animated stats */}
          <Stagger className="mt-20 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              [1200, t.stats.coaches],
              [9400, t.stats.clients],
              [86000, t.stats.sessions],
            ].map(([value, label], i) => (
              <StaggerItem key={i} className="card card-hover py-6 text-center">
                <p className="font-heading text-2xl font-semibold md:text-3xl">
                  <Counter value={value as number} />+
                </p>
                <p className="mt-1 text-xs text-soft">{label as string}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ============ 2 · Journey ============ */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <FadeIn className="text-center">
          <h2 className="text-3xl font-semibold md:text-4xl">{t.journeyTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl text-soft">{t.journeySub}</p>
        </FadeIn>
        <Stagger className="mt-14 grid gap-5 md:grid-cols-3">
          {t.journey.map((step, i) => (
            <StaggerItem key={i} className="card card-hover relative overflow-hidden p-7">
              <span className="font-heading text-5xl font-semibold text-sage/25">
                0{i + 1}
              </span>
              <h3 className="mt-3 text-xl font-semibold">{step.t}</h3>
              <p className="mt-2 leading-relaxed text-soft">{step.d}</p>
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sage/50 to-transparent" />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ============ 3 · Benefits ============ */}
      <section className="bg-canvas2/60 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn className="text-center">
            <h2 className="text-3xl font-semibold md:text-4xl">{t.benefitsTitle}</h2>
          </FadeIn>
          <Stagger className="mt-14 grid gap-5 sm:grid-cols-2">
            {t.benefits.map((b, i) => (
              <StaggerItem key={i} className="card card-hover flex gap-4 p-6">
                <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sage/15 text-sage-deep">
                  ✦
                </span>
                <div>
                  <h3 className="font-semibold">{b.t}</h3>
                  <p className="mt-1.5 leading-relaxed text-soft">{b.d}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ============ 4 · Features ============ */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <FadeIn className="text-center">
          <h2 className="text-3xl font-semibold md:text-4xl">{t.featuresTitle}</h2>
        </FadeIn>
        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.features.map((f, i) => (
            <StaggerItem key={i} className="card card-hover p-6">
              <span className="text-xl text-gold">{FEATURE_ICONS[i % FEATURE_ICONS.length]}</span>
              <h3 className="mt-3 font-semibold">{f.t}</h3>
              <p className="mt-1.5 text-soft">{f.d}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ============ 5 · Stories ============ */}
      <section className="mesh-bg py-24">
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <FadeIn className="text-center">
            <h2 className="text-3xl font-semibold md:text-4xl">{t.storiesTitle}</h2>
          </FadeIn>
          <Stagger className="mt-14 grid gap-5 md:grid-cols-3">
            {t.stories.map((s, i) => (
              <StaggerItem key={i} className="card card-hover flex flex-col p-7">
                <span className="font-heading text-4xl leading-none text-gold/60">“</span>
                <p className="mt-2 flex-1 leading-relaxed">{s.q}</p>
                <footer className="mt-5 border-t border-line pt-4">
                  <p className="font-semibold">{s.n}</p>
                  <p className="text-xs text-soft">{s.r}</p>
                </footer>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ============ 6 · Pricing ============ */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <FadeIn className="text-center">
          <h2 className="text-3xl font-semibold md:text-4xl">{t.pricingTitle}</h2>
          <p className="mt-3 text-soft">{t.pricingSub}</p>
        </FadeIn>
        <Stagger className="mt-14 grid gap-5 md:grid-cols-3">
          {t.plans.map((p, i) => (
            <StaggerItem
              key={i}
              className={`card relative flex flex-col p-7 ${
                p.featured ? "ring-glow border-sage/50" : "card-hover"
              }`}
            >
              <h3 className="font-semibold">{p.name}</h3>
              <p className="mt-4">
                <span className="font-heading text-4xl font-semibold">{p.price}</span>
                <span className="ms-2 text-xs text-soft">{p.period}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {p.points.map((point, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-soft">
                    <span className="mt-0.5 text-sage-deep">✓</span>
                    {point}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`${p.featured ? "btn-primary" : "btn-secondary"} mt-7 w-full`}
              >
                {p.cta}
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ============ 7 · FAQ ============ */}
      <section className="mx-auto max-w-3xl px-6 py-24">
        <FadeIn className="text-center">
          <h2 className="text-3xl font-semibold md:text-4xl">{t.faqTitle}</h2>
        </FadeIn>
        <div className="mt-12 space-y-3">
          {t.faq.map((item, i) => (
            <FaqItem key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* ============ 8 · CTA ============ */}
      <section className="px-6 pb-28">
        <FadeIn>
          <div className="mesh-bg relative mx-auto max-w-5xl overflow-hidden rounded-[24px] border border-line bg-surface px-8 py-20 text-center shadow-lift">
            <div className="relative z-10">
              <h2 className="text-3xl font-semibold md:text-5xl">
                <span className="text-gradient">{t.ctaTitle}</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-soft">{t.ctaSub}</p>
              <Link
                href="/signup"
                className="btn-primary mt-9 inline-flex px-9 py-4 text-base ring-glow"
              >
                {t.ctaButton}
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      <footer className="flex flex-col items-center gap-4 border-t border-line py-8 text-center text-xs text-soft">
        <span className="sm:hidden">
          <LocaleSwitcher current={locale} />
        </span>
        © {new Date().getFullYear()} {appName}
      </footer>
    </main>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card card-hover p-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 p-5 text-start"
      >
        <h3 className="font-medium">{q}</h3>
        <motion.span
          aria-hidden
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-lg text-soft"
        >
          +
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-5 leading-relaxed text-soft">{a}</p>
      </motion.div>
    </div>
  );
}
