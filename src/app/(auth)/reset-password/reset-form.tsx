"use client";

import { useActionState } from "react";
import { updatePassword, type AuthState } from "../actions";
import { resolveAuthError, type AuthErrorLabels } from "../login/login-form";

export function ResetForm({
  labels,
}: {
  labels: {
    newPassword: string;
    submit: string;
    passwordHint: string;
  } & AuthErrorLabels;
}) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    updatePassword,
    {}
  );
  const error = resolveAuthError(state.error, labels);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium" htmlFor="password">
          {labels.newPassword}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="input"
        />
        <p className="mt-1 text-xs text-soft">{labels.passwordHint}</p>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {labels.submit}
      </button>
    </form>
  );
}
