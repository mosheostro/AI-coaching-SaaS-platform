import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AI_MODES, BASE_SYSTEM, MODE_PROMPTS, type AiMode } from "@/lib/ai/modes";

export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
const MEMORY_RE = /<memory\s+kind="(goal|value|priority|theme|commitment|achievement|milestone|summary)">([\s\S]*?)<\/memory>/g;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI coach is not configured (missing ANTHROPIC_API_KEY)." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { sessionId?: string; mode?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = (body.message ?? "").trim().slice(0, 4000);
  if (!message) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }
  const mode: AiMode = AI_MODES.includes(body.mode as AiMode)
    ? (body.mode as AiMode)
    : "life";

  // --- Session: load or create (RLS scopes everything to this user) ---
  let sessionId = body.sessionId ?? null;
  if (sessionId) {
    const { data: s } = await supabase
      .from("ai_sessions")
      .select("id")
      .eq("id", sessionId)
      .single();
    if (!s) sessionId = null;
  }
  if (!sessionId) {
    const { data: s, error } = await supabase
      .from("ai_sessions")
      .insert({
        user_id: user.id,
        mode,
        title: message.slice(0, 60),
      })
      .select("id")
      .single();
    if (error || !s) {
      return NextResponse.json({ error: error?.message ?? "Session error" }, { status: 500 });
    }
    sessionId = s.id;
  }

  await supabase.from("ai_messages").insert({
    session_id: sessionId,
    user_id: user.id,
    role: "user",
    content: message,
  });

  // --- Context: memory + recent history ---
  const [{ data: memories }, { data: history }, { data: profile }] =
    await Promise.all([
      supabase
        .from("ai_memories")
        .select("kind, content, created_at")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(40),
      supabase
        .from("ai_messages")
        .select("role, content")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false })
        .limit(24),
      supabase.from("profiles").select("full_name, locale").eq("id", user.id).single(),
    ]);

  const memoryBlock =
    memories && memories.length > 0
      ? "MEMORY (durable facts about this client from past sessions):\n" +
        memories
          .map((m) => `- [${m.kind}] ${m.content}`)
          .join("\n")
      : "MEMORY: empty — this may be a new client.";

  const system = [
    BASE_SYSTEM,
    `Active mode: ${mode}. ${MODE_PROMPTS[mode]}`,
    `Client name: ${profile?.full_name || "unknown"}. Preferred UI language: ${profile?.locale ?? "en"}.`,
    memoryBlock,
  ].join("\n\n");

  const turns = (history ?? [])
    .reverse()
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  // --- Anthropic call ---
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system,
      messages: turns,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json(
      { error: `AI provider error (${res.status})`, detail: detail.slice(0, 300) },
      { status: 502 }
    );
  }

  const data = (await res.json()) as {
    content: Array<{ type: string; text?: string }>;
  };
  const raw = data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("\n");

  // --- Extract memory tags, strip from the visible reply ---
  const newMemories: { kind: string; content: string }[] = [];
  let match: RegExpExecArray | null;
  while ((match = MEMORY_RE.exec(raw)) !== null && newMemories.length < 3) {
    const content = match[2].trim().slice(0, 500);
    if (content) newMemories.push({ kind: match[1], content });
  }
  const reply = raw.replace(MEMORY_RE, "").trim();

  await supabase.from("ai_messages").insert({
    session_id: sessionId,
    user_id: user.id,
    role: "assistant",
    content: reply,
  });

  if (newMemories.length > 0) {
    await supabase.from("ai_memories").insert(
      newMemories.map((m) => ({
        user_id: user.id,
        kind: m.kind,
        content: m.content,
        source_session: sessionId,
      }))
    );
  }

  // touch session for ordering
  await supabase
    .from("ai_sessions")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", sessionId);

  return NextResponse.json({ sessionId, reply });
}
