"use client";

import { Clock, StickyNote } from "lucide-react";
import { StatusButton } from "@/components/kitchen/StatusButton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatJamWIB, formatWaktuRelatif } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { KitchenOrderDTO } from "@/types/api";
import type { OrderStatus } from "@/types/db";

type OrderCardProps = {
  order: KitchenOrderDTO;
  now: Date;
  updating: boolean;
  onAdvance: (orderId: string, nextStatus: OrderStatus) => void;
};

export function OrderCard({
  order,
  now,
  updating,
  onAdvance,
}: OrderCardProps) {
  const elapsedMinutes = Math.max(
    0,
    Math.floor((now.getTime() - new Date(order.createdAt).getTime()) / 60_000)
  );
  const isActive = order.status !== "selesai";
  const isCriticalWait = isActive && elapsedMinutes >= 20;
  const isWarningWait = isActive && !isCriticalWait && elapsedMinutes >= 10;

  const customerLabel = order.customerName?.trim() || "Customer";

  return (
    <Card
      className={cn(
        "flex h-full flex-col justify-between rounded-2xl bg-card shadow-sm transition-all animate-in fade-in-0 slide-in-from-bottom-2 duration-200",
        isCriticalWait
          ? "border-2 border-destructive"
          : isWarningWait
            ? "border-2 border-brand-yellow"
            : "border border-border"
      )}
    >
      <div>
        <CardHeader className="space-y-2 pb-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-display text-2xl font-extrabold text-foreground tabular-nums">
              #{order.orderNo}
            </span>
            <StatusBadge status={order.status} />
          </div>

          <div className="space-y-1">
            <p className="text-base font-bold text-foreground">
              {customerLabel}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 font-semibold">
                <Clock className="size-3.5" aria-hidden="true" />
                <span>
                  {formatJamWIB(order.createdAt)} ·{" "}
                  {formatWaktuRelatif(order.createdAt, now)}
                </span>
              </span>

              {isCriticalWait ? (
                <Badge className="border-transparent bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground">
                  Menunggu {elapsedMinutes} mnt
                </Badge>
              ) : isWarningWait ? (
                <Badge className="border-transparent bg-brand-yellow px-2 py-0.5 text-xs font-bold text-foreground">
                  Menunggu {elapsedMinutes} mnt
                </Badge>
              ) : null}
            </div>
          </div>
        </CardHeader>

        <Separator className="bg-border" />

        <CardContent className="space-y-3 pt-4">
          <ul className="space-y-2.5">
            {order.items.map((item, idx) => (
              <li key={`${order.id}-${idx}`} className="space-y-0.5">
                <p className="text-lg font-extrabold leading-snug text-foreground">
                  <span className="tabular-nums">{item.qty}×</span> {item.name}
                </p>
                {item.variants.length > 0 ? (
                  <p className="pl-6 text-sm font-semibold text-muted-foreground">
                    {item.variants.join(", ")}
                  </p>
                ) : null}
                {item.note ? (
                  <p className="flex items-start gap-1.5 pl-6 text-sm font-medium text-foreground">
                    <StickyNote
                      className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span>{item.note}</span>
                  </p>
                ) : null}
              </li>
            ))}
          </ul>

          {order.note ? (
            <div className="rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground">
              <span className="font-bold">Catatan pesanan: </span>
              <span>{order.note}</span>
            </div>
          ) : null}
        </CardContent>
      </div>

      {order.status !== "selesai" ? (
        <CardFooter className="pt-3">
          <StatusButton
            status={order.status}
            updating={updating}
            onAdvance={(nextStatus) => onAdvance(order.id, nextStatus)}
          />
        </CardFooter>
      ) : null}
    </Card>
  );
}
