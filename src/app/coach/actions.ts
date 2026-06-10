"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error?: string; ok?: boolean };

export async function addClientByEmail(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();

  const { error } = await supabase.rpc("add_client_by_email", {
    p_email: email,
  });

  if (error) return { error: error.message };
  revalidatePath("/coach/clients");
  return { ok: true };
}

export async function createSession(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("coaching_sessions").insert({
    coach_id: user.id,
    client_id: String(formData.get("client_id")),
    title: String(formData.get("title")),
    scheduled_at: new Date(String(formData.get("scheduled_at"))).toISOString(),
    duration_min: Number(formData.get("duration_min") ?? 60),
  });

  if (error) return { error: error.message };
  revalidatePath("/coach/sessions");
  return { ok: true };
}

export async function updateSessionStatus(formData: FormData) {
  const supabase = await createClient();
  await supabase
    .from("coaching_sessions")
    .update({ status: String(formData.get("status")) })
    .eq("id", String(formData.get("session_id")));
  revalidatePath("/coach/sessions");
}

export async function assignTask(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const due = String(formData.get("due_date") ?? "");

  const { error } = await supabase.from("tasks").insert({
    coach_id: user.id,
    client_id: String(formData.get("client_id")),
    title: String(formData.get("title")),
    description: String(formData.get("description") ?? "") || null,
    due_date: due || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/coach/tasks");
  return { ok: true };
}

export async function reviewSubmission(formData: FormData) {
  const supabase = await createClient();
  const decision = String(formData.get("decision")); // 'approved' | 'returned'
  const taskId = String(formData.get("task_id"));
  const submissionId = String(formData.get("submission_id"));
  const feedback = String(formData.get("feedback") ?? "") || null;

  await supabase
    .from("task_submissions")
    .update({ feedback, reviewed_at: new Date().toISOString() })
    .eq("id", submissionId);

  const { data: task } = await supabase
    .from("tasks")
    .update({ status: decision })
    .eq("id", taskId)
    .select("coach_id, client_id")
    .single();

  // Approved homework feeds the progress chart
  if (decision === "approved" && task) {
    await supabase.from("progress_metrics").insert({
      coach_id: task.coach_id,
      client_id: task.client_id,
      metric_key: "tasks_completed",
      value: 1,
    });
  }

  revalidatePath("/coach/tasks");
}
