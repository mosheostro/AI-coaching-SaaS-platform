"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/app/(auth)/actions";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar } from "@/components/ui";
import type { Locale } from "@/i18n/config";

export interface NavItem {
  href: string;
  label: string;
}

export function AppShell({
  appName,
  nav,
  userName,
  logoutLabel,
  locale,
  children,
}: {
  appName: string;
  nav: NavItem[];
  userName: string;
  logoutLabel: string;
  locale: Locale;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the drawer on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const navLinks = nav.map((item) => {
    const current = pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={current ? "page" : undefined}
        className={`group flex items-center gap-2 rounded-xl px-3 py-2.5 transition ${
          current
            ? "bg-sage/15 text-ink font-medium"
            : "text-soft hover:bg-sage/10 hover:text-ink"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full transition ${
            current ? "bg-sage" : "bg-line group-hover:bg-sage"
          }`}
        />
        {item.label}
      </Link>
    );
  });

  const userBlock = (
    <div className="space-y-3 border-t border-line/60 p-3">
      <div className="flex items-center gap-2.5 px-2">
        <Avatar name={userName} />
        <span className="truncate text-ink">{userName}</span>
      </div>
      <LocaleSwitcher current={locale} />
      <form action={logout}>
        <button type="submit" className="btn-secondary w-full">
          {logoutLabel}
        </button>
      </form>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile top bar */}
      <header dir="ltr" className="glass sticky top-0 z-40 flex items-center justify-between px-4 py-3 md:hidden">
        <Link href="/" className="font-heading text-lg font-semibold">{appName}</Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div
            className="absolute inset-0 bg-ink/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="glass absolute inset-x-3 top-16 z-10 flex flex-col rounded-card shadow-lift">
            <nav className="space-y-1 p-3">{navLinks}</nav>
            {userBlock}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="glass sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-e border-line md:flex">
        <div className="flex items-center justify-between border-b border-line/60 px-5 py-4">
          <Link href="/" className="font-heading text-lg font-semibold">{appName}</Link>
          <ThemeToggle />
        </div>
        <nav className="flex-1 space-y-1 p-3">{navLinks}</nav>
        {userBlock}
      </aside>

      <main id="content" className="mesh-bg w-full max-w-6xl flex-1 p-4 sm:p-6 md:p-8">
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}
