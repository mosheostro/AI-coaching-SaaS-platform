"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type AuthState } from "../actions";
import { Turnstile } from "@/components/turnstile";

export type AuthErrorLabels = {
  invalidEmail: string;
  weakPassword: string;
  tooManyAttempts: string;
  genericError: string;
};

export function resolveAuthError(
  code: string | undefined,
  labels: AuthErrorLabels
): string | undefined {
  if (!code) return undefined;
  const map: Record<string, string> = {
    invalidEmail: labels.invalidEmail,
    weakPassword: labels.weakPassword,
    tooManyAttempts: labels.tooManyAttempts,
    genericError: labels.genericError,
  };
  return map[code] ?? code;
}

export function LoginForm({
  labels,
}: {
  labels: {
    email: string;
    password: string;
    submit: string;
    forgotPassword: string;
  } & AuthErrorLabels;
}) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    login,
    {}
  );
  const error = resolveAuthError(state.error, labels);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium" htmlFor="email">
          {labels.email}
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
      </div>
      <div>
        <label className="block mb-1 font-medium" htmlFor="password">
          {labels.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          className="input"
        />
      </div>
      <div className="text-sm">
        <Link href="/forgot-password" className="text-primary-600 hover:underline">
          {labels.forgotPassword}
        </Link>
      </div>
      <Turnstile />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {labels.submit}
      </button>
    </form>
  );
}
