"use client";

import { useMemo, useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { Money } from "@/components/shared/Money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";
import type { MenuItemDTO } from "@/types/api";

type VariantDialogProps = {
  item: MenuItemDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: {
    item: MenuItemDTO;
    variants: string[];
    note: string;
  }) => void;
};

type VariantBodyProps = {
  item: MenuItemDTO;
  counts: Record<string, number>;
  note: string;
  totalSelected: number;
  onSelectSingle: (name: string) => void;
  onAdjustMulti: (name: string, delta: number) => void;
  onNoteChange: (note: string) => void;
};

function VariantSelectorBody({
  item,
  counts,
  note,
  totalSelected,
  onSelectSingle,
  onAdjustMulti,
  onNoteChange,
}: VariantBodyProps) {
  const isSinglePick = item.variantPick === 1;
  const isFull = totalSelected >= item.variantPick;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 rounded-xl bg-muted/60 px-3 py-2">
        <span className="text-xs font-semibold text-muted-foreground">
          {isSinglePick
            ? "Ketuk untuk memilih 1 rasa"
            : "Boleh memilih rasa yang sama lebih dari sekali"}
        </span>
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 font-bold tabular-nums",
            totalSelected === item.variantPick
              ? "border-transparent bg-brand-teal text-secondary-foreground"
              : "border-border bg-card text-foreground"
          )}
        >
          {totalSelected}/{item.variantPick} dipilih
        </Badge>
      </div>

      <div className="max-h-64 overflow-y-auto pr-1">
        <div className="space-y-2">
          {item.variants.map((variant) => {
            const count = counts[variant.name] ?? 0;

            if (isSinglePick) {
              const selected = count > 0;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => onSelectSingle(variant.name)}
                  className={cn(
                    "flex min-h-12 w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring",
                    selected
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted/50"
                  )}
                >
                  <span>{variant.name}</span>
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full border",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background"
                    )}
                  >
                    {selected ? <Check className="size-3.5" aria-hidden="true" /> : null}
                  </span>
                </button>
              );
            }

            return (
              <div
                key={variant.id}
                className={cn(
                  "flex min-h-12 items-center justify-between gap-3 rounded-xl border px-3.5 py-2 transition-colors",
                  count > 0
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card"
                )}
              >
                <button
                  type="button"
                  disabled={isFull}
                  onClick={() => onAdjustMulti(variant.name, 1)}
                  className="flex-1 text-left text-sm font-semibold text-foreground disabled:opacity-70"
                >
                  {variant.name}
                </button>

                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={count === 0}
                    onClick={() => onAdjustMulti(variant.name, -1)}
                    aria-label={`Kurangi ${variant.name}`}
                    className="size-11 rounded-xl"
                  >
                    <Minus className="size-4" aria-hidden="true" />
                  </Button>
                  <span className="w-7 text-center text-sm font-bold tabular-nums text-foreground">
                    {count}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={isFull}
                    onClick={() => onAdjustMulti(variant.name, 1)}
                    aria-label={`Tambah ${variant.name}`}
                    className="size-11 rounded-xl"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="variant-item-note" className="text-xs font-semibold">
          Catatan item (opsional)
        </Label>
        <Input
          id="variant-item-note"
          value={note}
          onChange={(e) => onNoteChange(e.target.value.slice(0, 120))}
          placeholder="Contoh: Sosis jangan terlalu kering"
          maxLength={120}
          className="h-11 rounded-xl"
        />
      </div>
    </div>
  );
}

export function VariantDialog({
  item,
  open,
  onOpenChange,
  onConfirm,
}: VariantDialogProps) {
  const isMobile = useIsMobile();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [note, setNote] = useState("");

  const totalSelected = useMemo(
    () => Object.values(counts).reduce((sum, count) => sum + count, 0),
    [counts]
  );

  function resetAndClose(nextOpen: boolean) {
    if (!nextOpen) {
      setCounts({});
      setNote("");
    }
    onOpenChange(nextOpen);
  }

  if (!item) return null;

  const canSubmit = totalSelected === item.variantPick;
  const subtitle = `Pilih ${item.variantPick} ${item.variantLabel}`;

  function handleSelectSingle(name: string) {
    setCounts({ [name]: 1 });
  }

  function handleAdjustMulti(name: string, delta: number) {
    setCounts((prev) => {
      const currentTotal = Object.values(prev).reduce((s, c) => s + c, 0);
      const current = prev[name] ?? 0;
      const next = current + delta;

      if (next < 0) return prev;
      if (delta > 0 && item && currentTotal >= item.variantPick) return prev;

      if (next === 0) {
        const rest = { ...prev };
        delete rest[name];
        return rest;
      }
      return { ...prev, [name]: next };
    });
  }

  function handleSubmit() {
    if (!item || !canSubmit) return;
    const expandedVariants: string[] = [];
    for (const variant of item.variants) {
      const count = counts[variant.name] ?? 0;
      for (let i = 0; i < count; i += 1) {
        expandedVariants.push(variant.name);
      }
    }
    onConfirm({ item, variants: expandedVariants, note: note.trim() });
    resetAndClose(false);
  }

  const body = (
    <VariantSelectorBody
      item={item}
      counts={counts}
      note={note}
      totalSelected={totalSelected}
      onSelectSingle={handleSelectSingle}
      onAdjustMulti={handleAdjustMulti}
      onNoteChange={setNote}
    />
  );

  const submitButton = (
    <Button
      type="button"
      size="lg"
      disabled={!canSubmit}
      onClick={handleSubmit}
      className="h-12 w-full rounded-xl text-base font-bold"
    >
      Tambah ke Pesanan
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={resetAndClose}>
        <DrawerContent className="flex max-h-[90dvh] flex-col overflow-hidden px-4 pb-6">
          <DrawerHeader className="shrink-0 px-0 text-left">
            <div className="flex items-baseline justify-between gap-2">
              <DrawerTitle className="font-display text-xl font-bold">
                {item.name}
              </DrawerTitle>
              <Money amount={item.price} className="text-base font-extrabold" />
            </div>
            <DrawerDescription>{subtitle}</DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
            {body}
          </div>
          <DrawerFooter className="shrink-0 px-0 pt-4">{submitButton}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="pr-10">
          <div className="flex items-baseline justify-between gap-2">
            <DialogTitle className="font-display text-xl font-bold">
              {item.name}
            </DialogTitle>
            <Money amount={item.price} className="text-base font-extrabold" />
          </div>
          <DialogDescription>{subtitle}</DialogDescription>
        </DialogHeader>
        {body}
        <DialogFooter>{submitButton}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
