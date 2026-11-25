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

function formatCustomerName(order: OrderDTO): string {
  return order.customerName?.trim() || "-";
}

type OrderListProps = {
  orders: OrderDTO[];
  onSelect: (orderId: string) => void;
};

export function OrderList({ orders, onSelect }: OrderListProps) {
  return (
    <>
      {/* Desktop & tablet table */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-xs md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="h-12 px-4 pl-6">No.</TableHead>
              <TableHead className="h-12 px-4">Waktu (WIB)</TableHead>
              <TableHead className="h-12 px-4">Nama Customer</TableHead>
              <TableHead className="h-12 px-4">Metode</TableHead>
              <TableHead className="h-12 px-4">Status</TableHead>
              <TableHead className="h-12 px-4 pr-6 text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                onClick={() => onSelect(order.id)}
                className="cursor-pointer hover:bg-muted/40"
              >
                <TableCell className="px-4 py-3.5 pl-6 font-display font-bold tabular-nums">
                  #{order.orderNo}
                </TableCell>
                <TableCell className="px-4 py-3.5 text-xs text-muted-foreground">
                  {formatWaktu(order.createdAt)}
                </TableCell>
                <TableCell className="px-4 py-3.5 font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <span>{formatCustomerName(order)}</span>
                    {order.paymentProofUrl ? (
                      <Badge variant="outline" className="gap-1 text-xs">
                        <Receipt className="size-3" aria-hidden="true" />
                        <span>Bukti</span>
                      </Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3.5 text-sm font-semibold">
                  {PAYMENT_LABEL[order.paymentMethod]}
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell className="px-4 py-3.5 pr-6 text-right font-extrabold text-foreground">
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
                  <span className="text-xs font-medium text-muted-foreground">
                    Nama:{" "}
                  </span>
                  {formatCustomerName(order)}
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
