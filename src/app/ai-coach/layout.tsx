import { AppShell } from "@/components/app-shell";
import { requireProfile } from "@/lib/auth";
import { getDictionary } from "@/i18n";

export default async function AiCoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();
  const { t, locale } = await getDictionary();

  return (
    <AppShell
      appName={t.app.name}
      locale={locale}
      userName={profile.full_name}
      logoutLabel={t.nav.logout}
      nav={[
        { href: "/dashboard", label: t.nav.dashboard },
        { href: "/ai-coach", label: t.ai.title },
        { href: "/ai-coach/insights", label: t.ai.insights },
      ]}
    >
      {children}
    </AppShell>
  );
}
