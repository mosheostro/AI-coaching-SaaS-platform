"use client";

import { useActionState } from "react";
import { requestPasswordReset, type AuthState } from "../actions";
import { Turnstile } from "@/components/turnstile";
import { resolveAuthError, type AuthErrorLabels } from "../login/login-form";

export function ForgotForm({
  labels,
}: {
  labels: {
    email: string;
    submit: string;
    sent: string;
  } & AuthErrorLabels;
}) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    requestPasswordReset,
    {}
  );

  if (state.message === "reset_sent") {
    return <p className="text-green-700">{labels.sent}</p>;
  }

  const error = resolveAuthError(state.error, labels);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium" htmlFor="email">
          {labels.email}
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
      </div>
      <Turnstile />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {labels.submit}
      </button>
    </form>
  );
}
