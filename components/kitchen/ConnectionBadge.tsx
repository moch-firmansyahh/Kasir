"use client";

import { Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ConnectionStatus } from "@/hooks/useKitchenOrders";
import { cn } from "@/lib/utils";

const STATUS_META: Record<
  ConnectionStatus,
  { label: string; dotClass: string; badgeClass: string; offline: boolean }
> = {
  connected: {
    label: "Terhubung",
    dotClass: "bg-brand-teal",
    badgeClass: "border-brand-teal/40 bg-card text-foreground",
    offline: false,
  },
  reconnecting: {
    label: "Menyambung ulang",
    dotClass: "bg-brand-yellow animate-pulse",
    badgeClass: "border-brand-yellow/60 bg-card text-foreground",
    offline: false,
  },
  disconnected: {
    label: "Terputus",
    dotClass: "bg-destructive",
    badgeClass: "border-destructive/50 bg-destructive/10 text-destructive",
    offline: true,
  },
};

type ConnectionBadgeProps = {
  status: ConnectionStatus;
};

export function ConnectionBadge({ status }: ConnectionBadgeProps) {
  const meta = STATUS_META[status];
  const Icon = meta.offline ? WifiOff : Wifi;

  return (
    <Badge
      variant="outline"
      className={cn(
        "min-h-9 gap-2 rounded-full px-3 text-xs font-bold",
        meta.badgeClass
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-2.5 rounded-full", meta.dotClass)}
      />
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{meta.label}</span>
    </Badge>
  );
}
