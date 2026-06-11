import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/i18n";
import { AiCoachClient } from "./ai-coach-client";

export const metadata = { title: "AI Coach" };

export default async function AiCoachPage() {
  await requireProfile();
  const { t } = await getDictionary();

  if (!process.env.ANTHROPIC_API_KEY) {
    return (
      <div className="card mx-auto max-w-lg p-8 text-center">
        <span className="text-2xl text-sage/60">✦</span>
        <p className="mt-3 text-soft">{t.ai.notConfigured}</p>
      </div>
    );
  }

  const supabase = await createClient();

  const { data: sessions } = await supabase
    .from("ai_sessions")
    .select("id, mode, title, updated_at")
    .order("updated_at", { ascending: false })
    .limit(30);

  return (
    <AiCoachClient
      initialSessions={sessions ?? []}
      labels={{
        title: t.ai.title,
        subtitle: t.ai.subtitle,
        newSession: t.ai.newSession,
        modeLabel: t.ai.modeLabel,
        thinking: t.ai.thinking,
        emptySessions: t.ai.emptySessions,
        firstPrompt: t.ai.firstPrompt,
        typeMessage: t.common.typeMessage,
        send: t.common.send,
        modes: t.ai.modes,
      }}
    />
  );
}
