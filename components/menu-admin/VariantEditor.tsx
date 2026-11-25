"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type EditableVariant = {
  name: string;
  sortOrder: number;
};

type VariantEditorProps = {
  variantLabel: string;
  variantPick: number;
  variants: EditableVariant[];
  onVariantLabelChange: (label: string) => void;
  onVariantPickChange: (pick: number) => void;
  onVariantsChange: (variants: EditableVariant[]) => void;
};

export function VariantEditor({
  variantLabel,
  variantPick,
  variants,
  onVariantLabelChange,
  onVariantPickChange,
  onVariantsChange,
}: VariantEditorProps) {
  const [newVariant, setNewVariant] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  const pickTooHigh = variantPick > 0 && variants.length < variantPick;

  function handleAddVariant() {
    const trimmed = newVariant.trim().slice(0, 50);
    if (!trimmed) return;

    const duplicate = variants.some(
      (v) => v.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setAddError("Nama varian sudah ada.");
      return;
    }

    setAddError(null);
    onVariantsChange([
      ...variants,
      { name: trimmed, sortOrder: variants.length },
    ]);
    setNewVariant("");
  }

  function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= variants.length) return;
    const next = [...variants];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onVariantsChange(
      next.map((v, idx) => ({ ...v, sortOrder: idx }))
    );
  }

  function handleRemove(index: number) {
    const next = variants
      .filter((_, idx) => idx !== index)
      .map((v, idx) => ({ ...v, sortOrder: idx }));
    onVariantsChange(next);
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-3.5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="menu-variant-label" className="text-xs font-semibold">
            Label varian
          </Label>
          <Input
            id="menu-variant-label"
            value={variantLabel}
            onChange={(e) => onVariantLabelChange(e.target.value.slice(0, 40))}
            placeholder="Varian"
            maxLength={40}
            className="h-10 rounded-xl bg-card"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="menu-variant-pick" className="text-xs font-semibold">
            Wajib pilih (0 = tanpa varian)
          </Label>
          <Input
            id="menu-variant-pick"
            type="text"
            inputMode="numeric"
            value={String(variantPick)}
            onChange={(e) => {
              const digits = e.target.value.replace(/[^\d]/g, "");
              const parsed = digits ? Number.parseInt(digits, 10) : 0;
              onVariantPickChange(Math.min(parsed, 20));
            }}
            className="h-10 rounded-xl bg-card tabular-nums"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="new-variant-input" className="text-xs font-semibold">
          Daftar varian ({variants.length})
        </Label>
        <div className="flex gap-2">
          <Input
            id="new-variant-input"
            value={newVariant}
            onChange={(e) => {
              setNewVariant(e.target.value.slice(0, 50));
              if (addError) setAddError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddVariant();
              }
            }}
            placeholder="Tambah nama varian (mis. Coklat)"
            className="h-10 rounded-xl bg-card"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddVariant}
            className="h-10 shrink-0 gap-1 rounded-xl px-3 font-bold"
          >
            <Plus className="size-4" aria-hidden="true" />
            <span>Tambah</span>
          </Button>
        </div>
        {addError ? (
          <p className="text-xs font-semibold text-destructive">{addError}</p>
        ) : null}
      </div>

      {variants.length > 0 ? (
        <ul className="space-y-1.5">
          {variants.map((variant, index) => (
            <li
              key={`${variant.name}-${index}`}
              className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-1.5"
            >
              <span className="truncate text-sm font-semibold text-foreground">
                {variant.name}
              </span>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={index === 0}
                  onClick={() => handleMove(index, -1)}
                  aria-label={`Naikkan urutan ${variant.name}`}
                  className="size-11 rounded-xl"
                >
                  <ArrowUp className="size-3.5" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={index === variants.length - 1}
                  onClick={() => handleMove(index, 1)}
                  aria-label={`Turunkan urutan ${variant.name}`}
                  className="size-11 rounded-xl"
                >
                  <ArrowDown className="size-3.5" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(index)}
                  aria-label={`Hapus varian ${variant.name}`}
                  className="size-11 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {pickTooHigh ? (
        <p role="alert" className="text-xs font-semibold text-destructive">
          Jumlah varian minimal harus {variantPick} karena wajib pilih diatur{" "}
          {variantPick}.
        </p>
      ) : null}
    </div>
  );
}
