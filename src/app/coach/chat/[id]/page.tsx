import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/i18n";
import { ChatThread } from "@/components/chat-thread";
import type { Message } from "@/lib/types";

export default async function CoachChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireProfile("coach");
  const { t } = await getDictionary();
  const supabase = await createClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, client:profiles!conversations_client_id_fkey(full_name)")
    .eq("id", id)
    .single();

  if (!conversation) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at")
    .limit(100);

  const client = conversation.client as unknown as { full_name: string } | null;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{client?.full_name}</h1>
      <ChatThread
        conversationId={id}
        currentUserId={profile.id}
        initialMessages={(messages ?? []) as Message[]}
        labels={{ placeholder: t.common.typeMessage, send: t.common.send }}
      />
    </div>
  );
}
