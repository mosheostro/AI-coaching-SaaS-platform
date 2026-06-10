import { AppShell } from "@/components/app-shell";
import { requireProfile } from "@/lib/auth";
import { getDictionary } from "@/i18n";

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile("coach");
  const { t, locale } = await getDictionary();

  return (
    <AppShell
      appName={t.app.name}
      locale={locale}
      userName={profile.full_name}
      logoutLabel={t.nav.logout}
      nav={[
        { href: "/coach/dashboard", label: t.nav.dashboard },
        { href: "/coach/clients", label: t.nav.clients },
        { href: "/coach/sessions", label: t.nav.sessions },
        { href: "/coach/tasks", label: t.nav.tasks },
        { href: "/coach/chat", label: t.nav.chat },
      ]}
    >
      {children}
    </AppShell>
  );
}
