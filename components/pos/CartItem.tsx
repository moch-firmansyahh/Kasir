"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, StickyNote, Trash2, UtensilsCrossed } from "lucide-react";
import { Money } from "@/components/shared/Money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CartLine } from "@/lib/store/cart";

type CartItemProps = {
  line: CartLine;
  invalid?: boolean;
  onUpdateQty: (key: string, delta: number) => void;
  onSetNote: (key: string, note: string) => void;
  onRemove: (key: string) => void;
};

export function CartItem({
  line,
  invalid = false,
  onUpdateQty,
  onSetNote,
  onRemove,
}: CartItemProps) {
  const [editingNote, setEditingNote] = useState(false);
  const [draftNote, setDraftNote] = useState(line.note);

  function saveNote() {
    onSetNote(line.key, draftNote);
    setEditingNote(false);
  }

  return (
    <div
      className={cn(
        "space-y-2 rounded-xl border bg-card p-3",
        invalid ? "border-destructive bg-destructive/5" : "border-border"
      )}
    >
      <div className="flex items-start gap-2.5">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted/60">
          {line.imageUrl ? (
            <Image
              src={line.imageUrl}
              alt={line.name}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <UtensilsCrossed className="size-5" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-bold leading-snug text-foreground">
              {line.name}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove(line.key)}
              aria-label={`Hapus ${line.name}`}
              className="size-11 shrink-0 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </div>

          {line.variants.length > 0 ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {line.variants.join(", ")}
            </p>
          ) : null}

          {invalid ? (
            <p className="mt-1 text-xs font-semibold text-destructive">
              Menu tidak tersedia, hapus baris ini.
            </p>
          ) : null}

          {line.note && !editingNote ? (
            <button
              type="button"
              onClick={() => {
                setDraftNote(line.note);
                setEditingNote(true);
              }}
              className="mt-1 flex items-center gap-1 text-left text-xs text-muted-foreground hover:text-foreground"
            >
              <StickyNote className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{line.note}</span>
            </button>
          ) : null}
        </div>
      </div>

      {editingNote ? (
        <div className="flex items-center gap-1.5">
          <Input
            value={draftNote}
            onChange={(e) => setDraftNote(e.target.value.slice(0, 120))}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveNote();
            }}
            placeholder="Catatan item (opsional)"
            aria-label={`Catatan untuk ${line.name}`}
            maxLength={120}
            className="h-9 rounded-lg text-xs"
          />
          <Button
            type="button"
            size="sm"
            onClick={saveNote}
            className="h-9 shrink-0 rounded-lg px-3 text-xs font-bold"
          >
            Simpan
          </Button>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-2">
          <Money
            amount={line.price * line.qty}
            className="text-sm font-extrabold text-foreground"
          />
          {!line.note && !editingNote ? (
            <button
              type="button"
              onClick={() => {
                setDraftNote("");
                setEditingNote(true);
              }}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <StickyNote className="size-3" aria-hidden="true" />
              <span>Catatan</span>
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onUpdateQty(line.key, -1)}
            aria-label={`Kurangi jumlah ${line.name}`}
            className="size-11 rounded-xl"
          >
            <Minus className="size-4" aria-hidden="true" />
          </Button>
          <span className="w-7 text-center text-sm font-bold tabular-nums text-foreground">
            {line.qty}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onUpdateQty(line.key, 1)}
            aria-label={`Tambah jumlah ${line.name}`}
            className="size-11 rounded-xl"
          >
            <Plus className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
