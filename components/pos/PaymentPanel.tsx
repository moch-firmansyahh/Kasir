"use client";

import { Banknote, Landmark, QrCode, type LucideIcon } from "lucide-react";
import { Money } from "@/components/shared/Money";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types/db";

const PAYMENT_OPTIONS: {
  value: PaymentMethod;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "cash", label: "Tunai", icon: Banknote },
  { value: "qris", label: "QRIS", icon: QrCode },
  { value: "transfer", label: "Transfer", icon: Landmark },
];

type PaymentPanelProps = {
  paymentMethod: PaymentMethod | null;
  cashReceivedInput: string;
  total: number;
  onSelectMethod: (method: PaymentMethod) => void;
  onCashReceivedChange: (value: string) => void;
};

export function PaymentPanel({
  paymentMethod,
  cashReceivedInput,
  total,
  onSelectMethod,
  onCashReceivedChange,
}: PaymentPanelProps) {
  const cashReceived = cashReceivedInput.trim()
    ? Number.parseInt(cashReceivedInput.trim(), 10)
    : null;
  const change =
    cashReceived !== null && Number.isFinite(cashReceived)
      ? Math.max(0, cashReceived - total)
      : 0;
  const isCashShort =
    cashReceived !== null && Number.isFinite(cashReceived) && cashReceived < total;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">
          Metode bayar
        </span>
        {!paymentMethod ? (
          <span className="text-xs font-semibold text-muted-foreground">
            Pilih metode bayar
          </span>
        ) : null}
      </div>

      <div
        role="radiogroup"
        aria-label="Metode pembayaran"
        className="grid grid-cols-3 gap-2"
      >
        {PAYMENT_OPTIONS.map((option) => {
          const Icon = option.icon;
          const selected = paymentMethod === option.value;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelectMethod(option.value)}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-xs font-bold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring",
                selected
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-border bg-card text-foreground hover:bg-muted/60"
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      {paymentMethod === "cash" ? (
        <div className="space-y-2 rounded-xl border border-border bg-card p-3">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="cash-received-input" className="text-xs font-semibold">
              Uang diterima
            </Label>
            <Input
              id="cash-received-input"
              type="text"
              inputMode="numeric"
              value={cashReceivedInput}
              onChange={(e) => {
                const digits = e.target.value.replace(/[^\d]/g, "");
                onCashReceivedChange(digits);
              }}
              placeholder="Nominal (opsional)"
              className="h-10 w-36 rounded-lg text-right text-sm font-bold tabular-nums"
            />
          </div>

          {cashReceived !== null ? (
            <div className="flex items-center justify-between gap-2 text-xs">
              <span
                className={cn(
                  "font-semibold",
                  isCashShort ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {isCashShort ? "Uang kurang" : "Kembalian"}
              </span>
              <Money
                amount={isCashShort ? total - cashReceived : change}
                className={cn(
                  "font-extrabold",
                  isCashShort ? "text-destructive" : "text-foreground"
                )}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
