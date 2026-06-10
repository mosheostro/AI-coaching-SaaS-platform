"use client";

import { useActionState } from "react";
import { submitTask, type ActionState } from "../actions";

export function SubmitTaskForm({
  taskId,
  labels,
}: {
  taskId: string;
  labels: { placeholder: string; submit: string };
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    submitTask,
    {}
  );

  return (
    <form action={action} className="mt-4 border-t border-slate-100 pt-4 space-y-2">
      <input type="hidden" name="task_id" value={taskId} />
      <textarea
        name="content"
        rows={3}
        required
        placeholder={labels.placeholder}
        className="input"
      />
      {state.error && <p className="text-red-600 text-sm">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary">
        {labels.submit}
      </button>
    </form>
  );
}
