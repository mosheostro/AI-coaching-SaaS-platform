"use client";

import { useActionState } from "react";
import { createSession, type ActionState } from "../actions";

export function CreateSessionForm({
  clients,
  labels,
}: {
  clients: { id: string; full_name: string }[];
  labels: {
    title: string;
    date: string;
    duration: string;
    submit: string;
    client: string;
  };
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    createSession,
    {}
  );

  return (
    <form action={action} className="card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
      <div className="lg:col-span-2">
        <label className="block mb-1 font-medium">{labels.title}</label>
        <input name="title" required className="input" />
      </div>
      <div>
        <label className="block mb-1 font-medium">{labels.client}</label>
        <select name="client_id" required className="input">
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1 font-medium">{labels.date}</label>
        <input name="scheduled_at" type="datetime-local" required className="input" />
      </div>
      <div>
        <label className="block mb-1 font-medium">{labels.duration}</label>
        <input
          name="duration_min"
          type="number"
          min={15}
          max={480}
          defaultValue={60}
          className="input"
        />
      </div>
      <button
        type="submit"
        disabled={pending || clients.length === 0}
        className="btn-primary lg:col-span-5 sm:w-fit"
      >
        {labels.submit}
      </button>
      {state.error && <p className="text-red-600 text-sm lg:col-span-5">{state.error}</p>}
    </form>
  );
}
