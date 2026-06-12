import Link from "next/link";
import { getDictionary } from "@/i18n";
import { SignupForm } from "./signup-form";

export default async function SignupPage() {
  const { t } = await getDictionary();

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
          <h1 className="text-xl font-semibold mb-6">{t.auth.signup}</h1>
          <SignupForm
            labels={{
              email: t.auth.email,
              password: t.auth.password,
              fullName: t.auth.fullName,
              iAmCoach: t.auth.iAmCoach,
              iAmClient: t.auth.iAmClient,
              submit: t.auth.signup,
              checkEmail: t.auth.checkEmail,
            }}
          />
          <p className="mt-4 text-slate-500">
            {t.auth.haveAccount}{" "}
            <Link href="/login" className="text-primary-600 hover:underline">
              {t.auth.login}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
