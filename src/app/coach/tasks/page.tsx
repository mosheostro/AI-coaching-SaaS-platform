import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/i18n";
import { EmptyState, StatusBadge } from "@/components/ui";
import { AssignTaskForm } from "./assign-task-form";
import { reviewSubmission } from "../actions";

export default async function CoachTasksPage() {
  const profile = await requireProfile("coach");
  const { t, locale } = await getDictionary();
  const supabase = await createClient();

  const [{ data: links }, { data: tasks }] = await Promise.all([
    supabase
      .from("coach_clients")
      .select("client:profiles!coach_clients_client_id_fkey(id, full_name)")
      .eq("coach_id", profile.id)
      .eq("status", "active"),
    supabase
      .from("tasks")
      .select(
        "*, client:profiles!tasks_client_id_fkey(full_name), submissions:task_submissions(*)"
      )
      .eq("coach_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const clients =
    (links ?? [])
      .map((l) => l.client as unknown as { id: string; full_name: string } | null)
      .filter((c): c is { id: string; full_name: string } => !!c) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t.nav.tasks}</h1>

      <AssignTaskForm
        clients={clients}
        labels={{
          title: t.common.title,
          description: t.common.description,
          dueDate: t.common.dueDate,
          client: t.nav.clients,
          submit: t.coach.assignTask,
        }}
      />

      {!tasks || tasks.length === 0 ? (
        <EmptyState message={t.client.noTasks} />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const submission = (task.submissions as Array<Record<string, unknown>> | null)?.[0] as
              | { id: string; content: string | null; submitted_at: string }
              | undefined;
            return (
              <div key={task.id} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-slate-500">
                      {(task.client as { full_name: string } | null)?.full_name}
                      {task.due_date &&
                        ` · ${t.common.dueDate}: ${new Date(task.due_date).toLocaleDateString(locale)}`}
                    </p>
                  </div>
                  <StatusBadge
                    status={task.status}
                    label={t.common.statuses[task.status as keyof typeof t.common.statuses]}
                  />
                </div>

                {task.status === "submitted" && submission && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {submission.content}
                    </p>
                    <form
                      action={reviewSubmission}
                      className="mt-3 flex flex-col sm:flex-row gap-2"
                    >
                      <input type="hidden" name="task_id" value={task.id} />
                      <input
                        type="hidden"
                        name="submission_id"
                        value={submission.id}
                      />
                      <input
                        name="feedback"
                        placeholder={t.coach.feedback}
                        className="input flex-1"
                      />
                      <button
                        type="submit"
                        name="decision"
                        value="approved"
                        className="btn-primary"
                      >
                        {t.coach.approve}
                      </button>
                      <button
                        type="submit"
                        name="decision"
                        value="returned"
                        className="btn-secondary"
                      >
                        {t.coach.return}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
