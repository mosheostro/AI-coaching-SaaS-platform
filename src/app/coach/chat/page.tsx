import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/i18n";
import { Avatar, EmptyState } from "@/components/ui";

export default async function CoachChatListPage() {
  const profile = await requireProfile("coach");
  const { t } = await getDictionary();
  const supabase = await createClient();

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, client:profiles!conversations_client_id_fkey(full_name)")
    .eq("coach_id", profile.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t.nav.chat}</h1>
      {!conversations || conversations.length === 0 ? (
        <EmptyState message={t.coach.noClients} />
      ) : (
        <div className="card divide-y divide-slate-100 p-0">
          {conversations.map((c) => {
            const client = c.client as unknown as { full_name: string } | null;
            return (
              <Link
                key={c.id}
                href={`/coach/chat/${c.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition"
              >
                <Avatar name={client?.full_name ?? "?"} />
                <span className="font-medium">{client?.full_name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
