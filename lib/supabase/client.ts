import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedRealtimeClient: SupabaseClient | null = null;

/**
 * Returns a browser-safe Supabase client using the publishable/anon key.
 * Intended strictly for Realtime subscriptions (never for writes or sensitive reads).
 */
export function getSupabaseRealtimeClient(): SupabaseClient {
  if (cachedRealtimeClient) {
    return cachedRealtimeClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !publishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
    );
  }

  cachedRealtimeClient = createClient(supabaseUrl, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedRealtimeClient;
}
