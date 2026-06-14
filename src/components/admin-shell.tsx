"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/app/(auth)/actions";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar } from "@/components/ui";
import type { Locale } from "@/i18n/config";

type Icon = keyof typeof ICONS;
export type AdminNavItem = { href: string; label: string; icon: Icon };
export type AdminNavGroup = { section: string; items: AdminNavItem[] };

const ICONS = {
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  chart: "M3 3v18h18M7 14l3-3 3 3 5-6",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11",
  coach: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M17 11l2 2 4-4",
  client: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  ai: "M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15.5 10.1 11 5.5 9l4.6-1.4zM18 16l.9 2.1L21 19l-2.1.9L18 22l-.9-2.1L15 19l2.1-.9z",
  inbox: "M22 12h-6l-2 3h-4l-2-3H2M5.5 5h13l3.5 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  doc: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h6",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3.6 15a1.65 1.65 0 0 0-1.51-1H2a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 3.6 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6h.09A1.65 1.65 0 0 0 9 3.09V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 16 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.09A1.65 1.65 0 0 0 21 10h.09a2 2 0 0 1 0 4H21a1.65 1.65 0 0 0-1.51 1z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  id: "M3 5h18v14H3zM7 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4M7 14c-1.5 0-3 .8-3 2M13 8h5M13 12h5M13 16h3",
};

function IconSvg({ name }: { name: Icon }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d={ICONS[name]} />
    </svg>
  );
}

export function AdminShell({
  appName,
  groups,
  userName,
  logoutLabel,
  locale,
  mustChangePassword = false,
  children,
}: {
  appName: string;
  groups: AdminNavGroup[];
  userName: string;
  logoutLabel: string;
  locale: Locale;
  mustChangePassword?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  // Force the first-login password change before anything else.
  useEffect(() => {
    if (mustChangePassword && pathname !== "/admin/account") {
      router.replace("/admin/account");
    }
  }, [mustChangePassword, pathname, router]);

  const renderNav = () =>
    groups.map((g) => (
      <div key={g.section} className="mb-4">
        <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-soft/60">{g.section}</p>
        <div className="space-y-0.5">
          {g.items.map((item) => {
            const current = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition ${
                  current ? "bg-sage/15 text-ink font-medium" : "text-soft hover:bg-sage/10 hover:text-ink"
                }`}
              >
                <span className={current ? "text-sage-deep" : "text-soft group-hover:text-sage-deep"}>
                  <IconSvg name={item.icon} />
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    ));

  const userBlock = (
    <div className="space-y-3 border-t border-line/60 p-3">
      <Link href="/" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-soft transition hover:bg-sage/10 hover:text-ink">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to site
      </Link>
      <div className="flex items-center gap-2.5 px-2">
        <Avatar name={userName} />
        <div className="min-w-0">
          <p className="truncate text-sm text-ink">{userName}</p>
          <p className="text-[11px] text-soft">Administrator</p>
        </div>
      </div>
      <LocaleSwitcher current={locale} />
      <form action={logout}>
        <button type="submit" className="btn-secondary w-full">{logoutLabel}</button>
      </form>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile top bar */}
      <header dir="ltr" className="glass sticky top-0 z-40 flex items-center justify-between px-4 py-3 md:hidden">
        <Link href="/admin" className="font-heading text-lg font-semibold">{appName} <span className="text-sage">Admin</span></Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button type="button" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-ink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-ink/20 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden />
          <div className="glass absolute inset-x-3 top-16 z-10 flex max-h-[80vh] flex-col overflow-y-auto rounded-card shadow-lift">
            <nav className="p-3">{renderNav()}</nav>
            {userBlock}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="glass sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-e border-line md:flex">
        <div className="flex items-center justify-between border-b border-line/60 px-5 py-4">
          <Link href="/admin" className="font-heading text-base font-semibold">{appName} <span className="text-sage">Admin</span></Link>
          <ThemeToggle />
        </div>
        <nav className="flex-1 overflow-y-auto p-3">{renderNav()}</nav>
        {userBlock}
      </aside>

      <main id="content" className="mesh-bg w-full flex-1 p-4 sm:p-6 md:p-8">
        <div className="relative z-10 mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
