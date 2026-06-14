import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { LeadsBoard, type Lead } from "./leads-board";

export default async function LeadsPage() {
  await requireProfile("admin");
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("id, name, email, subject, message, type, status, page, created_at")
    .order("created_at", { ascending: false })
    .limit(300);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold">Leads &amp; CRM</h1>
        <p className="text-soft text-sm">Contact, partnership, collaboration, and support requests.</p>
      </header>
      <LeadsBoard leads={(data ?? []) as Lead[]} />
    </div>
  );
}
