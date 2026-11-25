import { KitchenBoard } from "@/components/kitchen/KitchenBoard";
import { getSupabaseServerClient } from "@/lib/supabase/server";

async function getStoreName(): Promise<string> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("settings")
      .select("store_name")
      .eq("id", 1)
      .maybeSingle();

    if (!error && data && typeof data.store_name === "string" && data.store_name.trim()) {
      return data.store_name;
    }
  } catch {
    // Fallback gracefully
  }
  return "Cemal Cemul";
}

export default async function DapurPage() {
  const storeName = await getStoreName();

  return <KitchenBoard storeName={storeName} />;
}
