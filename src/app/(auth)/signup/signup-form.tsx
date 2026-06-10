"use client";

import { useActionState } from "react";
import { signup, type AuthState } from "../actions";

export function SignupForm({
  labels,
}: {
  labels: {
    email: string;
    password: string;
    fullName: string;
    iAmCoach: string;
    iAmClient: string;
    submit: string;
    checkEmail: string;
  };
}) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signup,
    {}
  );

  if (state.message === "check_email") {
    return <p className="text-green-700">{labels.checkEmail}</p>;
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium" htmlFor="full_name">
          {labels.fullName}
        </label>
        <input id="full_name" name="full_name" required className="input" />
      </div>
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
      <fieldset className="flex gap-4">
        <label className="flex items-center gap-2">
          <input type="radio" name="role" value="coach" defaultChecked />
          {labels.iAmCoach}
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="role" value="client" />
          {labels.iAmClient}
        </label>
      </fieldset>
      {state.error && <p className="text-red-600 text-sm">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {labels.submit}
      </button>
    </form>
  );
}
