import Link from "next/link";
import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n";
import { createClient } from "@/lib/supabase/server";
import { ResetForm } from "./reset-form";

export default async function ResetPasswordPage() {
  const { t } = await getDictionary();

  // The recovery link must have established a session (via /auth/confirm).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/forgot-password");

  return (
    <main className="flex min-h-[100dvh] flex-col">
      <header dir="ltr" className="flex items-center gap-2 px-4 py-3 sm:px-6">
        <Link
          href="/"
          aria-label="Home"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-soft transition hover:border-sage/50 hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V21h14V9.5" />
          </svg>
        </Link>
        <Link href="/" className="font-heading text-lg font-semibold">
          {t.app.name}
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="card w-full max-w-sm">
          <h1 className="text-xl font-semibold mb-6">{t.auth.resetPassword}</h1>
          <ResetForm
            labels={{
              newPassword: t.auth.newPassword,
              submit: t.auth.updatePassword,
              passwordHint: t.auth.passwordHint,
              invalidEmail: t.auth.invalidEmail,
              weakPassword: t.auth.weakPassword,
              tooManyAttempts: t.auth.tooManyAttempts,
              genericError: t.auth.genericError,
            }}
          />
        </div>
      </div>
    </main>
  );
}
