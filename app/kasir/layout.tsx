import { KasirShell } from "@/components/kasir/KasirShell";
import { RoleGuard } from "@/components/shared/RoleGuard";
import { getStoreName } from "@/lib/settings-server";

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
