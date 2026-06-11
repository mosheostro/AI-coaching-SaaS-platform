import { AppShell } from "@/components/app-shell";
import { requireProfile } from "@/lib/auth";
import { getDictionary } from "@/i18n";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile("client");
  const { t, locale } = await getDictionary();
  const aiEnabled = !!process.env.ANTHROPIC_API_KEY;

  return (
    <AppShell
      appName={t.app.name}
      locale={locale}
      userName={profile.full_name}
      logoutLabel={t.nav.logout}
      nav={[
        { href: "/client/dashboard", label: t.nav.dashboard },
        { href: "/client/tasks", label: t.nav.tasks },
        { href: "/client/sessions", label: t.nav.sessions },
        { href: "/client/chat", label: t.nav.chat },
        ...(aiEnabled ? [{ href: "/ai-coach", label: t.ai.title }] : []),
      ]}
    >
      {children}
    </AppShell>
  );
}
