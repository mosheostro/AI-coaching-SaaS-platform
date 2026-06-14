import { requireProfile } from "@/lib/auth";
import { AccountForms } from "./account-forms";

export default async function AccountPage() {
  const me = await requireProfile("admin");
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold">Account &amp; security</h1>
        <p className="text-soft text-sm">Update your administrator credentials and profile.</p>
      </header>
      {me.must_change_password && (
        <div className="rounded-card border border-amber-400/50 bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          You are using default credentials. Set a new password below to secure the platform.
        </div>
      )}
      <AccountForms fullName={me.full_name} email={me.email} />
    </div>
  );
}
