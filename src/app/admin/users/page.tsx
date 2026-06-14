import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { UsersTable, type AdminUser } from "./users-table";

export default async function UsersPage() {
  await requireProfile("admin");
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, status, created_at, last_seen_at")
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold">User management</h1>
        <p className="text-soft text-sm">Search, filter, edit roles, suspend, reset, or remove users.</p>
      </header>
      <UsersTable users={(data ?? []) as AdminUser[]} />
    </div>
  );
}
