import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/db";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  baru: {
    label: "Baru",
    className: "bg-brand-pink text-foreground border-transparent",
  },
  dimasak: {
    label: "Dimasak",
    className: "bg-brand-yellow text-foreground border-transparent",
  },
  selesai: {
    label: "Selesai",
    className: "bg-brand-teal text-secondary-foreground border-transparent",
  },
};

type StatusBadgeProps = {
  status: OrderStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge
      variant="outline"
      className={cn("px-2.5 py-0.5 text-xs font-semibold", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
