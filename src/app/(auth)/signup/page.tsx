import Link from "next/link";
import { getDictionary } from "@/i18n";
import { SignupForm } from "./signup-form";

export default async function SignupPage() {
  const { t } = await getDictionary();

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
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
    </main>
  );
}
