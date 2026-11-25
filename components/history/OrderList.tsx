"use client";

import { Receipt } from "lucide-react";
import { Money } from "@/components/shared/Money";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatWaktu } from "@/lib/format";
import type { OrderDTO } from "@/types/api";
import type { PaymentMethod } from "@/types/db";

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cash: "Tunai",
  qris: "QRIS",
  transfer: "Transfer",
};

function formatCustomerOrTable(order: OrderDTO): string {
  const parts: string[] = [];
  if (order.customerName?.trim()) parts.push(order.customerName.trim());
  if (order.orderType === "dine_in") {
    parts.push(order.tableNo?.trim() ? `Meja ${order.tableNo.trim()}` : "Dine In");
  } else {
    parts.push("Take Away");
  }
  return parts.join(" · ");
}

type OrderListProps = {
  orders: OrderDTO[];
  onSelect: (orderId: string) => void;
};

export function OrderList({ orders, onSelect }: OrderListProps) {
  return (
    <>
      {/* Desktop & tablet table */}
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-xs md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>No.</TableHead>
              <TableHead>Waktu (WIB)</TableHead>
              <TableHead>Customer / Meja</TableHead>
              <TableHead>Metode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                onClick={() => onSelect(order.id)}
                className="cursor-pointer hover:bg-muted/40"
              >
                <TableCell className="font-display font-bold tabular-nums">
                  #{order.orderNo}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatWaktu(order.createdAt)}
                </TableCell>
                <TableCell className="font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <span>{formatCustomerOrTable(order)}</span>
                    {order.paymentProofUrl ? (
                      <Badge variant="outline" className="gap-1 text-xs">
                        <Receipt className="size-3" aria-hidden="true" />
                        <span>Bukti</span>
                      </Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="text-sm font-semibold">
                  {PAYMENT_LABEL[order.paymentMethod]}
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-right font-extrabold text-foreground">
                  <Money amount={order.total} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card list */}
      <div className="space-y-3 md:hidden">
        {orders.map((order) => (
          <button
            key={order.id}
            type="button"
            onClick={() => onSelect(order.id)}
            className="block w-full text-left outline-none focus-visible:ring-3 focus-visible:ring-ring rounded-2xl"
          >
            <Card className="rounded-2xl border-border bg-card shadow-xs active:scale-[0.99]">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-lg font-bold text-foreground tabular-nums">
                    #{order.orderNo}
                  </span>
                  <StatusBadge status={order.status} />
                </div>

                <p className="text-sm font-semibold text-foreground">
                  {formatCustomerOrTable(order)}
                </p>

                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    {formatWaktu(order.createdAt)} ·{" "}
                    {PAYMENT_LABEL[order.paymentMethod]}
                  </span>
                  <Money
                    amount={order.total}
                    className="text-sm font-extrabold text-foreground"
                  />
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </>
  );
}
