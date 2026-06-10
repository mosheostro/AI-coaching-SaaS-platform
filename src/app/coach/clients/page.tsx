import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/i18n";
import { Avatar, EmptyState } from "@/components/ui";
import { AddClientForm } from "./add-client-form";

export default async function CoachClientsPage() {
  const profile = await requireProfile("coach");
  const { t } = await getDictionary();
  const supabase = await createClient();

  const { data: links } = await supabase
    .from("coach_clients")
    .select("id, status, started_at, client:profiles!coach_clients_client_id_fkey(id, full_name, email)")
    .eq("coach_id", profile.id)
    .order("started_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t.nav.clients}</h1>
      </div>

      <AddClientForm
        labels={{ email: t.coach.clientEmail, submit: t.coach.addClient }}
      />

      {!links || links.length === 0 ? (
        <EmptyState message={t.coach.noClients} />
      ) : (
        <div className="card divide-y divide-slate-100 p-0">
          {links.map((link) => {
            const client = link.client as unknown as {
              id: string;
              full_name: string;
              email: string;
            } | null;
            if (!client) return null;
            return (
              <div key={link.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={client.full_name} />
                <div className="flex-1">
                  <p className="font-medium">{client.full_name}</p>
                  <p className="text-slate-500">{client.email}</p>
                </div>
                <span className="badge bg-slate-100 text-slate-600">
                  {link.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
