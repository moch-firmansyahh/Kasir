import "server-only";
import { unstable_cache } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const fetchStoreNameCached = unstable_cache(
  async (): Promise<string> => {
    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from("settings")
        .select("store_name")
        .eq("id", 1)
        .maybeSingle();

      if (
        !error &&
        data &&
        typeof data.store_name === "string" &&
        data.store_name.trim()
      ) {
        return data.store_name;
      }
    } catch {
      // Fallback gracefully when env or DB is unreachable
    }
    return "Cemal Cemul";
  },
  ["store-name"],
  { tags: ["settings"], revalidate: 300 }
);

/**
 * Returns the cached store name so Kasir/Dapur layouts do not re-query Supabase on every navigation.
 */
export async function getStoreName(): Promise<string> {
  return fetchStoreNameCached();
}
