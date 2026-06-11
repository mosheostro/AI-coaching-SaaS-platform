import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/i18n";
import { AiCoachClient } from "./ai-coach-client";

export const metadata = { title: "AI Coach" };

export default async function AiCoachPage() {
  await requireProfile();
  const { t } = await getDictionary();
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
