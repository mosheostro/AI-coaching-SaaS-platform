import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NotificationsList, type Notif } from "./notifications-list";

export default async function NotificationsPage() {
  await requireProfile("admin");
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("id, kind, title, body, link, read_at, created_at, audience")
    .in("audience", ["admin", "platform"])
    .order("created_at", { ascending: false })
    .limit(100);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold">Notifications center</h1>
        <p className="text-soft text-sm">Platform alerts, lead and support notifications.</p>
      </header>
      <NotificationsList items={(data ?? []) as Notif[]} />
    </div>
  );
}
