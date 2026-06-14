import { createClient as createSb, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client for privileged admin operations (e.g. deleting an auth
 * user). Returns null if SUPABASE_SERVICE_ROLE_KEY isn't configured, so callers
 * can degrade gracefully instead of crashing. NEVER import this in client code.
 */
export function createAdminClient(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!key || !url) return null;
  return createSb(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
