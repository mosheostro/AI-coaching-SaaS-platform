"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireProfile } from "@/lib/auth";
import { passwordProblem } from "@/lib/auth-validation";
import { getOrigin } from "@/lib/site-url";
import type { UserRole } from "@/lib/types";

export type ActionState = { error?: string; message?: string };

async function audit(action: string, targetType: string, targetId: string, meta: Record<string, unknown> = {}) {
  const me = await requireProfile("admin");
  const supabase = await createClient();
  await supabase.from("admin_audit_log").insert({
    actor_id: me.id,
    actor_email: me.email,
    action,
    target_type: targetType,
    target_id: targetId,
    meta,
  });
}

export async function suspendUser(id: string, reason?: string) {
  await requireProfile("admin");
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ status: "suspended", suspended_at: new Date().toISOString(), suspended_reason: reason ?? null })
    .eq("id", id);
  await audit("user.suspend", "user", id, { reason });
  revalidatePath("/admin/users");
}

export async function reactivateUser(id: string) {
  await requireProfile("admin");
  const supabase = await createClient();
  await supabase.from("profiles").update({ status: "active", suspended_at: null, suspended_reason: null }).eq("id", id);
  await audit("user.reactivate", "user", id);
  revalidatePath("/admin/users");
}

export async function changeUserRole(id: string, role: UserRole) {
  await requireProfile("admin");
  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("id", id);
  await audit("user.role_change", "user", id, { role });
  revalidatePath("/admin/users");
}

export async function sendUserReset(email: string) {
  await requireProfile("admin");
  const supabase = await createClient();
  const origin = await getOrigin();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/confirm?next=/reset-password` });
  await audit("user.password_reset_sent", "user", email);
  revalidatePath("/admin/users");
}

export async function deleteUser(id: string): Promise<ActionState> {
  await requireProfile("admin");
  const admin = createAdminClient();
  if (!admin) {
    return { error: "Set SUPABASE_SERVICE_ROLE_KEY to enable user deletion." };
  }
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return { error: error.message };
  await audit("user.delete", "user", id);
  revalidatePath("/admin/users");
  return { message: "deleted" };
}

export async function updateLeadStatus(id: string, status: string) {
  await requireProfile("admin");
  const supabase = await createClient();
  await supabase
    .from("contact_messages")
    .update({ status, responded_at: status === "closed" ? new Date().toISOString() : null })
    .eq("id", id);
  await audit("lead.status", "lead", id, { status });
  revalidatePath("/admin/leads");
}

export async function markNotificationRead(id: string) {
  await requireProfile("admin");
  const supabase = await createClient();
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/notifications");
}

export async function saveOwnerProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireProfile("admin");
  const supabase = await createClient();
  const social = {
    twitter: String(formData.get("twitter") ?? ""),
    linkedin: String(formData.get("linkedin") ?? ""),
    instagram: String(formData.get("instagram") ?? ""),
    youtube: String(formData.get("youtube") ?? ""),
  };
  const languages = String(formData.get("languages") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const { error } = await supabase
    .from("owner_profile")
    .update({
      full_name: String(formData.get("full_name") ?? ""),
      display_name: String(formData.get("display_name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      bio: String(formData.get("bio") ?? ""),
      website: String(formData.get("website") ?? ""),
      contact: String(formData.get("contact") ?? ""),
      languages,
      social_links: social,
    })
    .eq("id", true);
  if (error) return { error: error.message };
  await audit("owner_profile.update", "owner_profile", "owner");
  revalidatePath("/admin/owner");
  return { message: "saved" };
}

export async function savePlatformSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireProfile("admin");
  const supabase = await createClient();
  const { error } = await supabase
    .from("platform_settings")
    .update({
      branding: {
        name: String(formData.get("brand_name") ?? ""),
        tagline: String(formData.get("brand_tagline") ?? ""),
        logo_url: String(formData.get("logo_url") ?? ""),
      },
      seo: {
        title: String(formData.get("seo_title") ?? ""),
        description: String(formData.get("seo_description") ?? ""),
        og_image: String(formData.get("og_image") ?? ""),
      },
      email: {
        from: String(formData.get("email_from") ?? ""),
        reply_to: String(formData.get("email_reply") ?? ""),
      },
      social: {
        twitter: String(formData.get("s_twitter") ?? ""),
        linkedin: String(formData.get("s_linkedin") ?? ""),
        instagram: String(formData.get("s_instagram") ?? ""),
      },
    })
    .eq("id", true);
  if (error) return { error: error.message };
  await audit("settings.update", "settings", "platform");
  revalidatePath("/admin/settings");
  return { message: "saved" };
}

export async function changeMyPassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const me = await requireProfile("admin");
  const password = String(formData.get("password") ?? "");
  if (passwordProblem(password)) {
    return { error: "Password must be at least 8 characters and include a letter and a number." };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  await supabase.from("profiles").update({ must_change_password: false }).eq("id", me.id);
  await audit("admin.password_changed", "user", me.id);
  revalidatePath("/admin", "layout");
  redirect("/admin");
}

export async function updateMyAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const me = await requireProfile("admin");
  const supabase = await createClient();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (fullName) await supabase.from("profiles").update({ full_name: fullName }).eq("id", me.id);
  if (email && email !== me.email) {
    const { error } = await supabase.auth.updateUser({ email });
    if (error) return { error: error.message };
  }
  await audit("admin.account_update", "user", me.id);
  revalidatePath("/admin", "layout");
  return { message: "saved" };
}

export async function setCoachApproval(id: string, approval_status: "pending" | "approved" | "rejected") {
  await requireProfile("admin");
  const supabase = await createClient();
  await supabase.from("coach_profiles").update({ approval_status }).eq("id", id);
  await audit("coach.approval", "coach", id, { approval_status });
  revalidatePath("/admin/coaches");
}
