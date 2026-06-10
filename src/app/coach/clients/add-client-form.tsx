"use client";

import { useActionState } from "react";
import { addClientByEmail, type ActionState } from "../actions";

export function AddClientForm({
  labels,
}: {
  labels: { email: string; submit: string };
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    addClientByEmail,
    {}
  );

  return (
    <form action={action} className="card flex flex-col sm:flex-row gap-3 sm:items-end">
      <div className="flex-1">
        <label className="block mb-1 font-medium" htmlFor="client_email">
          {labels.email}
        </label>
        <input
          id="client_email"
          name="email"
          type="email"
          required
          className="input"
        />
      </div>
      <button type="submit" disabled={pending} className="btn-primary">
        {labels.submit}
      </button>
      {state.error && (
        <p className="text-red-600 text-sm sm:self-center">{state.error}</p>
      )}
    </form>
  );
}
