"use client";

import { useEffect, useState } from "react";
import { StickyNote } from "lucide-react";
import { ProofViewer } from "@/components/history/ProofViewer";
import { Money } from "@/components/shared/Money";
import { ErrorState } from "@/components/shared/ErrorState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/useIsMobile";
import { formatWaktu } from "@/lib/format";
import type { ApiResponse, OrderDTO } from "@/types/api";
import type { PaymentMethod } from "@/types/db";

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cash: "Tunai",
  qris: "QRIS",
  transfer: "Transfer",
};

type OrderDetailProps = {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProofUpdated: (orderId: string, proofUrl: string) => void;
};

export function OrderDetail({
  orderId,
  open,
  onOpenChange,
  onProofUpdated,
}: OrderDetailProps) {
  const isMobile = useIsMobile();
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    if (!open || !orderId) return;
    let cancelled = false;

    fetch(`/api/orders/${orderId}`, { cache: "no-store" })
      .then(async (res) => {
        const json = (await res.json()) as ApiResponse<OrderDTO>;
        if (!res.ok || json.error) {
          throw new Error(json.error?.message ?? "Gagal memuat detail pesanan.");
        }
        return json.data;
      })
      .then((data) => {
        if (!cancelled) {
          setOrder(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Gagal memuat detail pesanan."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, orderId, reloadTick]);

  const showSkeleton = loading || (open && orderId !== null && order?.id !== orderId && !error);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={
          isMobile
            ? "flex max-h-[88vh] flex-col rounded-t-2xl bg-background px-4 pt-6 pb-6"
            : "flex w-full flex-col bg-background p-5 sm:max-w-md"
        }
      >
        <SheetHeader className="px-0 text-left">
          <div className="flex items-center justify-between gap-2 pr-6">
            <SheetTitle className="font-display text-xl font-bold">
              {order ? `Pesanan #${order.orderNo}` : "Detail Pesanan"}
            </SheetTitle>
            {order ? <StatusBadge status={order.status} /> : null}
          </div>
          <SheetDescription>
            {order
              ? formatWaktu(order.createdAt)
              : "Rincian item, total pembayaran, dan bukti bayar."}
          </SheetDescription>
        </SheetHeader>

        {showSkeleton ? (
          <div className="space-y-3 py-2">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => {
              setLoading(true);
              setError(null);
              setReloadTick((t) => t + 1);
            }}
          />
        ) : order ? (
          <ScrollArea className="min-h-0 flex-1 pr-2">
            <div className="space-y-4 pb-4">
              <div className="rounded-xl border border-border bg-card p-3.5 text-sm space-y-1">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-bold text-foreground">
                    {order.customerName?.trim() || "Customer"}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Metode bayar</span>
                  <span className="font-bold text-foreground">
                    {PAYMENT_LABEL[order.paymentMethod]}
                  </span>
                </div>
                {order.note ? (
                  <div className="pt-1 text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">Catatan: </span>
                    {order.note}
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-bold text-foreground">Daftar Item</p>
                <div className="space-y-2 rounded-xl border border-border bg-card p-3.5">
                  {(order.items ?? []).map((item) => (
                    <div key={item.id} className="space-y-0.5 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-foreground">
                          <span className="tabular-nums">{item.qty}×</span>{" "}
                          {item.name}
                        </span>
                        <Money
                          amount={item.price * item.qty}
                          className="shrink-0 font-bold text-foreground"
                        />
                      </div>
                      {item.variants.length > 0 ? (
                        <p className="pl-5 text-xs text-muted-foreground">
                          {item.variants.join(", ")}
                        </p>
                      ) : null}
                      {item.note ? (
                        <p className="flex items-center gap-1 pl-5 text-xs text-muted-foreground">
                          <StickyNote className="size-3" aria-hidden="true" />
                          <span>{item.note}</span>
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 rounded-xl border border-border bg-muted/40 p-3.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <Money amount={order.subtotal} className="font-semibold text-foreground" />
                </div>
                {order.discount > 0 ? (
                  <div className="flex justify-between text-destructive">
                    <span>
                      Diskon
                      {order.discountType === "percent"
                        ? ` (${order.discountValue}%)`
                        : ""}
                    </span>
                    <Money amount={order.discount} negative className="font-semibold" />
                  </div>
                ) : null}
                {order.taxPercent > 0 || order.tax > 0 ? (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Pajak ({order.taxPercent}%)</span>
                    <Money amount={order.tax} className="font-semibold text-foreground" />
                  </div>
                ) : null}
                <Separator className="my-1 bg-border" />
                <div className="flex justify-between text-base font-extrabold text-foreground">
                  <span>Total</span>
                  <Money amount={order.total} />
                </div>
              </div>

              <ProofViewer
                orderId={order.id}
                orderNo={order.orderNo}
                proofUrl={order.paymentProofUrl}
                onUploaded={(nextUrl) => {
                  setOrder((prev) =>
                    prev ? { ...prev, paymentProofUrl: nextUrl } : prev
                  );
                  onProofUpdated(order.id, nextUrl);
                }}
              />
            </div>
          </ScrollArea>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
