import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/i18n";
import { EmptyState, StatusBadge } from "@/components/ui";
import { SubmitTaskForm } from "./submit-task-form";

export default async function ClientTasksPage() {
  const profile = await requireProfile("client");
  const { t, locale } = await getDictionary();
  const supabase = await createClient();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, submissions:task_submissions(feedback, reviewed_at)")
    .eq("client_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t.nav.tasks}</h1>

      {!tasks || tasks.length === 0 ? (
        <EmptyState message={t.client.noTasks} />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const submission = (
              task.submissions as Array<{ feedback: string | null }> | null
            )?.[0];
            const canSubmit = ["assigned", "in_progress", "returned"].includes(
              task.status
            );
            return (
              <div key={task.id} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    {task.description && (
                      <p className="text-slate-500 mt-1 whitespace-pre-wrap">
                        {task.description}
                      </p>
                    )}
                    {task.due_date && (
                      <p className="text-slate-400 text-xs mt-1">
                        {t.common.dueDate}:{" "}
                        {new Date(task.due_date).toLocaleDateString(locale)}
                      </p>
                    )}
                  </div>
                  <StatusBadge
                    status={task.status}
                    label={t.common.statuses[task.status as keyof typeof t.common.statuses]}
                  />
                </div>

                {submission?.feedback && (
                  <p className="mt-3 rounded-lg bg-slate-50 p-3 text-slate-600">
                    {t.coach.feedback}: {submission.feedback}
                  </p>
                )}

                {canSubmit && (
                  <SubmitTaskForm
                    taskId={task.id}
                    labels={{
                      placeholder: t.client.yourAnswer,
                      submit: t.client.submit,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
