import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { SiteFooter } from "@/components/site-footer";
import { getLocale } from "@/i18n";

/** Shared frame for legal/info pages: stable header (back + home), footer. */
export async function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header dir="ltr" className="glass sticky top-0 z-40">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <Link href="/" className="font-heading text-lg font-semibold">
            Coach Online
          </Link>
          <div className="flex items-center gap-2">
            <LocaleSwitcher current={locale} />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main id="content" className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-6">
        <Link href="/" className="text-sm text-soft transition hover:text-ink">
          ← Home
        </Link>
        <h1 className="mt-4 text-3xl font-semibold md:text-4xl">{title}</h1>
        {updated && (
          <p className="mt-2 text-xs text-soft/70">Last updated: {updated}</p>
        )}
        <div className="prose-legal mt-8 space-y-5 leading-relaxed text-ink/90 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:text-[15px] [&_ul]:list-disc [&_ul]:ps-5 [&_li]:mt-1.5">
          {children}
        </div>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
