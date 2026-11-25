"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type OrderMetaProps = {
  customerName: string;
  orderNote: string;
  onCustomerNameChange: (value: string) => void;
  onOrderNoteChange: (value: string) => void;
};

export function OrderMeta({
  customerName,
  orderNote,
  onCustomerNameChange,
  onOrderNoteChange,
}: OrderMetaProps) {
  const [customerTouched, setCustomerTouched] = useState(false);
  const showCustomerError = customerTouched && customerName.trim().length === 0;

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label
          htmlFor="order-customer-name"
          className="text-xs font-bold text-foreground"
        >
          Nama customer <span className="text-destructive">*</span>
        </Label>
        <Input
          id="order-customer-name"
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          onBlur={() => setCustomerTouched(true)}
          placeholder="Masukkan nama customer (wajib)"
          maxLength={60}
          required
          aria-required="true"
          aria-invalid={showCustomerError}
          className="h-11 rounded-lg bg-card px-3.5"
        />
        {showCustomerError ? (
          <p className="text-xs font-medium text-destructive">
            Nama customer wajib diisi.
          </p>
        ) : null}
      </div>

      <div className="space-y-1">
        <Label htmlFor="order-note" className="sr-only">
          Catatan (opsional)
        </Label>
        <Textarea
          id="order-note"
          value={orderNote}
          onChange={(e) => onOrderNoteChange(e.target.value)}
          placeholder="Catatan (opsional)"
          maxLength={200}
          rows={2}
          className="min-h-11 resize-none rounded-lg bg-card px-3.5 py-2.5"
        />
      </div>
    </div>
  );
}
