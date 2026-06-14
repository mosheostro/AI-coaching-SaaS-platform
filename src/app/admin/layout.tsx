import { AdminShell, type AdminNavGroup } from "@/components/admin-shell";
import { requireProfile } from "@/lib/auth";
import { getDictionary } from "@/i18n";

const GROUPS: AdminNavGroup[] = [
  { section: "Main", items: [
    { href: "/admin", label: "Overview", icon: "grid" },
    { href: "/admin/analytics", label: "Analytics", icon: "chart" },
  ]},
  { section: "People", items: [
    { href: "/admin/users", label: "Users", icon: "users" },
    { href: "/admin/coaches", label: "Coaches", icon: "coach" },
    { href: "/admin/clients", label: "Clients", icon: "client" },
  ]},
  { section: "Engagement", items: [
    { href: "/admin/ai", label: "AI Coach", icon: "ai" },
    { href: "/admin/leads", label: "Leads / CRM", icon: "inbox" },
    { href: "/admin/notifications", label: "Notifications", icon: "bell" },
  ]},
  { section: "Platform", items: [
    { href: "/admin/content", label: "Content", icon: "doc" },
    { href: "/admin/settings", label: "Settings", icon: "gear" },
    { href: "/admin/security", label: "Security", icon: "shield" },
    { href: "/admin/owner", label: "Owner profile", icon: "id" },
  ]},
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile("admin");
  const { t, locale } = await getDictionary();

  return (
    <AdminShell
      appName={t.app.name}
      groups={GROUPS}
      userName={profile.full_name || profile.email}
      logoutLabel={t.nav.logout}
      locale={locale}
      mustChangePassword={profile.must_change_password}
    >
      {profile.must_change_password && (
        <div className="mb-6 flex items-start gap-3 rounded-card border border-amber-400/50 bg-amber-50 p-4 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
          </svg>
          <div>
            <p className="font-semibold">Default credentials in use</p>
            <p className="text-sm opacity-90">For security, change your password and email before using the platform. You can do this on the Account page.</p>
          </div>
        </div>
      )}
      {children}
    </AdminShell>
  );
}
