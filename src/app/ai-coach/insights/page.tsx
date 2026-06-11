import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/i18n";
import { EmptyState, StatCard } from "@/components/ui";

export const metadata = { title: "Insights" };

const KIND_ORDER = [
  "goal",
  "commitment",
  "theme",
  "achievement",
  "milestone",
  "value",
  "priority",
  "summary",
] as const;

export default async function InsightsPage() {
  await requireProfile();
  const { t, locale } = await getDictionary();
  const supabase = await createClient();

  const [{ data: memories }, sessionsRes] = await Promise.all([
    supabase
      .from("ai_memories")
      .select("kind, content, created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("ai_sessions")
      .select("id", { count: "exact", head: true }),
  ]);

  const byKind = new Map<string, { content: string; created_at: string }[]>();
  for (const m of memories ?? []) {
    const list = byKind.get(m.kind) ?? [];
    list.push(m);
    byKind.set(m.kind, list);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t.ai.insightsTitle}</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={t.ai.title} value={sessionsRes.count ?? 0} />
        <StatCard
          label={t.ai.kinds.goal}
          value={byKind.get("goal")?.length ?? 0}
        />
        <StatCard
          label={t.ai.kinds.commitment}
          value={byKind.get("commitment")?.length ?? 0}
        />
      </div>

      {(memories ?? []).length === 0 ? (
        <EmptyState message={t.ai.noMemories} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {KIND_ORDER.filter((k) => byKind.has(k)).map((kind) => (
            <section key={kind} className="card">
              <h2 className="eyebrow">{t.ai.kinds[kind]}</h2>
              <ul className="mt-3 space-y-2.5">
                {byKind.get(kind)!.slice(0, 8).map((m, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-sage-deep">✦</span>
                    <div>
                      <p className="leading-relaxed">{m.content}</p>
                      <p className="mt-0.5 text-xs text-soft/70">
                        {new Date(m.created_at).toLocaleDateString(locale)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
