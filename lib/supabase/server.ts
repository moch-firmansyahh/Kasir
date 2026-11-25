import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedServerClient: SupabaseClient | null = null;

/**
 * Returns a server-only Supabase client authenticated with the secret/service role key.
 * Never import this module from a Client Component.
 */
export function getSupabaseServerClient(): SupabaseClient {
  if (cachedServerClient) {
    return cachedServerClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !secretKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  cachedServerClient = createClient(supabaseUrl, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedServerClient;
}
