import Link from "next/link";
import { getDictionary } from "@/i18n";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
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
          <h1 className="text-xl font-semibold mb-6">{t.auth.login}</h1>
          <LoginForm
            labels={{
              email: t.auth.email,
              password: t.auth.password,
              submit: t.auth.login,
            }}
          />
          <p className="mt-4 text-slate-500">
            {t.auth.noAccount}{" "}
            <Link href="/signup" className="text-primary-600 hover:underline">
              {t.auth.signup}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
