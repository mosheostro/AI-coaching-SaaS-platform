import Link from "next/link";
import { getDictionary } from "@/i18n";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const { t } = await getDictionary();

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
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
    </main>
  );
}
