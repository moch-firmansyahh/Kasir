"use client";

import { CheckCircle2, Flame, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrderStatus } from "@/types/db";

type StatusButtonProps = {
  status: OrderStatus;
  updating: boolean;
  onAdvance: (nextStatus: OrderStatus) => void;
};

export function StatusButton({
  status,
  updating,
  onAdvance,
}: StatusButtonProps) {
  if (status === "selesai") {
    return null;
  }

  const isBaru = status === "baru";
  const nextStatus: OrderStatus = isBaru ? "dimasak" : "selesai";
  const label = isBaru ? "Mulai Masak" : "Selesai";

  return (
    <Button
      type="button"
      variant={isBaru ? "default" : "secondary"}
      disabled={updating}
      onClick={() => onAdvance(nextStatus)}
      className="h-14 w-full gap-2 rounded-xl text-base font-extrabold shadow-xs"
    >
      {updating ? (
        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
      ) : isBaru ? (
        <Flame className="size-5" aria-hidden="true" />
      ) : (
        <CheckCircle2 className="size-5" aria-hidden="true" />
      )}
      <span>{updating ? "Memperbarui..." : label}</span>
    </Button>
  );
}
