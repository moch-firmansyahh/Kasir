import { KasirShell } from "@/components/kasir/KasirShell";
import { RoleGuard } from "@/components/shared/RoleGuard";
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
    // Fallback gracefully when env or DB is not reachable yet (e.g. during Fase 1 setup)
  }
  return "Cemal Cemul";
}

export default async function KasirLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeName = await getStoreName();

  return (
    <RoleGuard allowedRole="kasir">
      <KasirShell storeName={storeName}>{children}</KasirShell>
    </RoleGuard>
  );
}
