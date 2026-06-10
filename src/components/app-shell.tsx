import Link from "next/link";
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
  return (
    <div className="flex min-h-screen">
      <aside className="glass sticky top-0 flex h-screen w-60 shrink-0 flex-col border-e border-line">
        <div className="flex items-center justify-between border-b border-line/60 px-5 py-4">
          <span className="font-heading text-lg font-semibold">{appName}</span>
          <ThemeToggle />
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-2 rounded-xl px-3 py-2.5 text-soft transition hover:bg-sage/10 hover:text-ink"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-line transition group-hover:bg-sage" />
              {item.label}
            </Link>
          ))}
        </nav>
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
      </aside>
      <main className="mesh-bg max-w-6xl flex-1 p-6 md:p-8">
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}
