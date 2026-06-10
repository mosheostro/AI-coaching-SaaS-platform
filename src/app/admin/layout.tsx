import { AppShell } from "@/components/app-shell";
import { requireProfile } from "@/lib/auth";
import { getDictionary } from "@/i18n";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile("admin");
  const { t, locale } = await getDictionary();

  return (
    <AppShell
      appName={t.app.name}
      locale={locale}
      userName={profile.full_name}
      logoutLabel={t.nav.logout}
      nav={[
        { href: "/admin", label: t.admin.title },
      ]}
    >
      {children}
    </AppShell>
  );
}
