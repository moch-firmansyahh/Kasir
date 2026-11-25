import { RoleGuard } from "@/components/shared/RoleGuard";

export default function DapurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard allowedRole="dapur">{children}</RoleGuard>;
}
