import { createClient } from "@/lib/supabase/server";

export type DayPoint = { day: string; value: number };

function lastNDays(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d);
    x.setDate(d.getDate() - i);
    out.push(x.toISOString().slice(0, 10));
  }
  return out;
}

function bucketByDay(dates: (string | null)[], days: number): number[] {
  const keys = lastNDays(days);
  const idx = new Map(keys.map((k, i) => [k, i]));
  const counts = new Array(days).fill(0);
  for (const d of dates) {
    if (!d) continue;
    const k = d.slice(0, 10);
    const i = idx.get(k);
    if (i !== undefined) counts[i]++;
  }
  return counts;
}

function pctDelta(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return ((curr - prev) / prev) * 100;
}

export async function getOverview() {
  const supabase = await createClient();
  const now = Date.now();
  const dayMs = 86_400_000;
  const iso = (ms: number) => new Date(ms).toISOString();
  const since30 = iso(now - 30 * dayMs);

  const [profilesRes, aiRes, sessRes, leadsRes, pvRes, secRes, notifRes] =
    await Promise.all([
      supabase.from("profiles").select("id, role, status, created_at, last_seen_at, full_name, email"),
      supabase.from("ai_sessions").select("status, topic, rating, message_count, mode, created_at"),
      supabase.from("coaching_sessions").select("status, created_at"),
      supabase.from("contact_messages").select("status, type, created_at"),
      supabase.from("analytics_events").select("event_type, source, device, country, path, created_at").gte("created_at", since30).limit(20000),
      supabase.from("security_events").select("type, created_at").gte("created_at", since30).limit(5000),
      supabase
        .from("notifications")
        .select("id, kind, title, body, created_at, read_at")
        .eq("audience", "admin")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  const profiles = profilesRes.data ?? [];
  const ai = aiRes.data ?? [];
  const sessions = sessRes.data ?? [];
  const leads = leadsRes.data ?? [];
  const pv = pvRes.data ?? [];
  const sec = secRes.data ?? [];

  const coaches = profiles.filter((p) => p.role === "coach").length;
  const clients = profiles.filter((p) => p.role === "client").length;
  const admins = profiles.filter((p) => p.role === "admin").length;
  const active = profiles.filter(
    (p) => p.last_seen_at && now - new Date(p.last_seen_at).getTime() < 30 * dayMs
  ).length;

  const regDates = profiles.map((p) => p.created_at);
  const reg7 = regDates.filter((d) => now - new Date(d).getTime() < 7 * dayMs).length;
  const regPrev7 = regDates.filter((d) => {
    const t = now - new Date(d).getTime();
    return t >= 7 * dayMs && t < 14 * dayMs;
  }).length;

  const aiCompleted = ai.filter((a) => a.status === "completed").length;
  const aiAbandoned = ai.filter((a) => a.status === "abandoned").length;
  const ratings = ai.map((a) => a.rating).filter((r): r is number => typeof r === "number");
  const avgRating = ratings.length ? ratings.reduce((s, r) => s + r, 0) / ratings.length : 0;
  const avgMsgs = ai.length ? ai.reduce((s, a) => s + (a.message_count ?? 0), 0) / ai.length : 0;

  const humanCompleted = sessions.filter((s) => s.status === "completed").length;
  const leadsOpen = leads.filter((l) => l.status !== "closed").length;

  // topic clustering
  const topicMap = new Map<string, number>();
  for (const a of ai) if (a.topic) topicMap.set(a.topic, (topicMap.get(a.topic) ?? 0) + 1);
  const topTopics = [...topicMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, value]) => ({ label, value }));

  // traffic sources
  const srcMap = new Map<string, number>();
  for (const e of pv) if (e.event_type === "pageview" && e.source) srcMap.set(e.source, (srcMap.get(e.source) ?? 0) + 1);
  const sources = [...srcMap.entries()].sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value }));

  // top pages
  const pageMap = new Map<string, number>();
  for (const e of pv) if (e.event_type === "pageview" && e.path) pageMap.set(e.path, (pageMap.get(e.path) ?? 0) + 1);
  const topPages = [...pageMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value]) => ({ label, value }));

  // devices
  const devMap = new Map<string, number>();
  for (const e of pv) if (e.device) devMap.set(e.device, (devMap.get(e.device) ?? 0) + 1);
  const devices = [...devMap.entries()].map(([label, value]) => ({ label, value }));

  // funnel
  const cnt = (t: string) => pv.filter((e) => e.event_type === t).length;
  const landing = pv.filter((e) => e.event_type === "pageview" && e.path === "/").length;
  const funnel = [
    { label: "Landing visits", value: landing },
    { label: "Registrations", value: cnt("signup") },
    { label: "Activation", value: cnt("activation") },
    { label: "Profile complete", value: cnt("profile_complete") },
    { label: "First session", value: cnt("first_session") },
    { label: "Returning", value: cnt("returning") },
  ];

  const pageviews30 = pv.filter((e) => e.event_type === "pageview").length;

  return {
    kpis: {
      totalUsers: profiles.length,
      activeUsers: active,
      coaches,
      clients,
      admins,
      aiSessions: ai.length,
      humanSessions: sessions.length,
      newRegs7: reg7,
      newRegsDelta: pctDelta(reg7, regPrev7),
      leadsOpen,
      pageviews30,
      avgRating,
      avgMsgs,
      aiCompletionRate: ai.length ? (aiCompleted / ai.length) * 100 : 0,
    },
    series: {
      registrations: bucketByDay(regDates, 30),
      pageviews: bucketByDay(pv.filter((e) => e.event_type === "pageview").map((e) => e.created_at), 30),
      aiSessions: bucketByDay(ai.map((a) => a.created_at), 30),
    },
    roleSplit: [
      { label: "Clients", value: clients },
      { label: "Coaches", value: coaches },
      { label: "Admins", value: admins },
    ],
    aiStatus: [
      { label: "Completed", value: aiCompleted },
      { label: "Abandoned", value: aiAbandoned },
      { label: "Active", value: ai.length - aiCompleted - aiAbandoned },
    ],
    topTopics,
    sources,
    topPages,
    devices,
    funnel,
    humanCompleted,
    security: {
      failedLogins: sec.filter((s) => s.type === "failed_login").length,
      lockouts: sec.filter((s) => s.type === "lockout").length,
      resets: sec.filter((s) => s.type === "password_reset").length,
    },
    recentUsers: [...profiles]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8),
    alerts: notifRes.data ?? [],
  };
}

export type Overview = Awaited<ReturnType<typeof getOverview>>;

export async function getTrafficGeo() {
  const supabase = await createClient();
  const since = new Date(Date.now() - 90 * 86_400_000).toISOString();
  const { data } = await supabase
    .from("analytics_events")
    .select("country, device, browser, locale, event_type")
    .gte("created_at", since)
    .limit(30000);
  const rows = data ?? [];
  const agg = (key: "country" | "device" | "browser" | "locale") => {
    const m = new Map<string, number>();
    for (const r of rows) {
      const v = (r as Record<string, string | null>)[key];
      if (v) m.set(v, (m.get(v) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value }));
  };
  return {
    countries: agg("country").slice(0, 10),
    devices: agg("device"),
    browsers: agg("browser"),
    locales: agg("locale"),
  };
}
