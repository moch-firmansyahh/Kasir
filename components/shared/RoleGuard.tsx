import { redirect } from "next/navigation";
import { getServerRole } from "@/lib/role-server";
import type { PosRole } from "@/lib/role";

type RoleGuardProps = {
  allowedRole: PosRole;
  children: React.ReactNode;
};

/**
 * Guards route views by display role stored in pos_role cookie.
 * This is a UI separation helper, not an authentication boundary (D1).
 */
export async function RoleGuard({ allowedRole, children }: RoleGuardProps) {
  const currentRole = await getServerRole();

  if (!currentRole || currentRole !== allowedRole) {
    redirect("/");
  }

  return <>{children}</>;
}
