"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { DiscountType } from "@/types/db";

type DiscountInputProps = {
  discountType: DiscountType;
  discountInput: string;
  error: string | null;
  onTypeChange: (type: DiscountType) => void;
  onInputChange: (value: string) => void;
};

export function DiscountInput({
  discountType,
  discountInput,
  error,
  onTypeChange,
  onInputChange,
}: DiscountInputProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="order-discount-input" className="text-sm font-semibold">
          Diskon
        </Label>

        <div className="flex items-center gap-1.5">
          <ToggleGroup
            type="single"
            value={discountType}
            onValueChange={(value) => {
              if (value === "percent" || value === "amount") {
                onTypeChange(value);
              }
            }}
            variant="outline"
            spacing={0}
            aria-label="Jenis diskon"
          >
            <ToggleGroupItem
              value="percent"
              aria-label="Diskon persen"
              className="h-11 min-w-11 px-3 text-sm font-bold data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              %
            </ToggleGroupItem>
            <ToggleGroupItem
              value="amount"
              aria-label="Diskon nominal rupiah"
              className="h-11 min-w-11 px-3 text-sm font-bold data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              Rp
            </ToggleGroupItem>
          </ToggleGroup>

          <Input
            id="order-discount-input"
            type="text"
            inputMode="numeric"
            value={discountInput}
            onChange={(e) => {
              const digitsOnly = e.target.value.replace(/[^\d]/g, "");
              onInputChange(digitsOnly);
            }}
            placeholder="0"
            aria-invalid={Boolean(error)}
            className="h-11 w-28 rounded-xl bg-card text-right font-semibold tabular-nums"
          />
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-right text-xs font-semibold text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
