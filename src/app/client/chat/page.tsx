import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/i18n";
import { ChatThread } from "@/components/chat-thread";
import { EmptyState } from "@/components/ui";
import type { Message } from "@/lib/types";

export default async function ClientChatPage() {
  const profile = await requireProfile("client");
  const { t } = await getDictionary();
  const supabase = await createClient();

  // MVP: a client chats with their (first) coach
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, coach:profiles!conversations_coach_id_fkey(full_name)")
    .eq("client_id", profile.id)
    .limit(1)
    .maybeSingle();

  if (!conversation) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">{t.nav.chat}</h1>
        <EmptyState message="—" />
      </div>
    );
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversation.id)
    .order("created_at")
    .limit(100);

  const coach = conversation.coach as unknown as { full_name: string } | null;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{coach?.full_name}</h1>
      <ChatThread
        conversationId={conversation.id}
        currentUserId={profile.id}
        initialMessages={(messages ?? []) as Message[]}
        labels={{ placeholder: t.common.typeMessage, send: t.common.send }}
      />
    </div>
  );
}
