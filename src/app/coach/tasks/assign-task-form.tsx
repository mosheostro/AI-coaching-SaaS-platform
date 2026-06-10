"use client";

import { useActionState } from "react";
import { assignTask, type ActionState } from "../actions";

export function AssignTaskForm({
  clients,
  labels,
}: {
  clients: { id: string; full_name: string }[];
  labels: {
    title: string;
    description: string;
    dueDate: string;
    client: string;
    submit: string;
  };
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    assignTask,
    {}
  );

  return (
    <form action={action} className="card space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
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
          <label className="block mb-1 font-medium">{labels.dueDate}</label>
          <input name="due_date" type="date" className="input" />
        </div>
      </div>
      <div>
        <label className="block mb-1 font-medium">{labels.description}</label>
        <textarea name="description" rows={2} className="input" />
      </div>
      {state.error && <p className="text-red-600 text-sm">{state.error}</p>}
      <button
        type="submit"
        disabled={pending || clients.length === 0}
        className="btn-primary"
      >
        {labels.submit}
      </button>
    </form>
  );
}
