import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types";

export async function requireProfile(role?: UserRole): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Suspended accounts cannot use the app.
  if ((profile as Profile).status === "suspended") {
    await supabase.auth.signOut();
    redirect("/login?error=suspended");
  }

  // Best-effort last-seen tracking (non-blocking).
  void supabase.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", user.id);

  if (role && profile.role !== role && profile.role !== "admin") {
    redirect("/dashboard");
  }

  return profile as Profile;
}
