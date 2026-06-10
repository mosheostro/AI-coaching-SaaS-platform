"use client";

import { useActionState } from "react";
import { login, type AuthState } from "../actions";

export function LoginForm({
  labels,
}: {
  labels: { email: string; password: string; submit: string };
}) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    login,
    {}
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium" htmlFor="email">
          {labels.email}
        </label>
        <input id="email" name="email" type="email" required className="input" />
      </div>
      <div>
        <label className="block mb-1 font-medium" htmlFor="password">
          {labels.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="input"
        />
      </div>
      {state.error && <p className="text-red-600 text-sm">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {labels.submit}
      </button>
    </form>
  );
}
