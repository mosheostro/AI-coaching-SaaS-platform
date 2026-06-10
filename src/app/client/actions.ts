"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error?: string; ok?: boolean };

export async function submitTask(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const taskId = String(formData.get("task_id"));

  const { error } = await supabase.from("task_submissions").insert({
    task_id: taskId,
    client_id: user.id,
    content: String(formData.get("content") ?? ""),
  });

  if (error) return { error: error.message };

  const { error: statusError } = await supabase
    .from("tasks")
    .update({ status: "submitted" })
    .eq("id", taskId);

  if (statusError) return { error: statusError.message };

  revalidatePath("/client/tasks");
  return { ok: true };
}
