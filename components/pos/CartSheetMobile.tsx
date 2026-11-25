"use client";

import { ShoppingBag } from "lucide-react";
import { Cart, type PendingProofRetry } from "@/components/pos/Cart";
import { Money } from "@/components/shared/Money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useViewportTier } from "@/hooks/useIsMobile";
import type { useCart } from "@/hooks/useCart";

type CartSheetResponsiveProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: ReturnType<typeof useCart>;
  taxPercent: number;
  proofFile: File | null;
  onProofFileChange: (file: File | null) => void;
  submitting: boolean;
  submitError: string | null;
  onSubmitOrder: () => void;
  retryProof: PendingProofRetry | null;
  retryingProof: boolean;
  onRetryProof: () => void;
  onDismissRetryProof: () => void;
};

/**
 * Mobile (<640px): sticky summary bar above bottom nav + bottom sheet.
 * Tablet (640-1023px): floating cart trigger + right drawer sheet.
 */
export function CartSheetResponsive({
  open,
  onOpenChange,
  cart,
  taxPercent,
  proofFile,
  onProofFileChange,
  submitting,
  submitError,
  onSubmitOrder,
  retryProof,
  retryingProof,
  onRetryProof,
  onDismissRetryProof,
}: CartSheetResponsiveProps) {
  const tier = useViewportTier();
  const isMobile = tier === "mobile";

  const cartElement = (
    <Cart
      cart={cart}
      taxPercent={taxPercent}
      proofFile={proofFile}
      onProofFileChange={onProofFileChange}
      submitting={submitting}
      submitError={submitError}
      onSubmitOrder={onSubmitOrder}
      retryProof={retryProof}
      retryingProof={retryingProof}
      onRetryProof={onRetryProof}
      onDismissRetryProof={onDismissRetryProof}
    />
  );

  return (
    <>
      {/* Mobile (<640px) compact summary bar */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-card px-4 py-2.5 shadow-md sm:hidden">
        <Button
          type="button"
          size="lg"
          onClick={() => onOpenChange(true)}
          className="flex h-12 w-full items-center justify-between rounded-xl px-4 text-sm font-bold shadow-sm"
        >
          <span className="flex items-center gap-2">
            <ShoppingBag className="size-4" aria-hidden="true" />
            <span>
              {cart.itemCount} item · <Money amount={cart.totals.total} />
            </span>
          </span>
          <span className="rounded-lg bg-foreground/10 px-2.5 py-1 text-xs font-extrabold">
            {retryProof ? "Foto Gagal" : "Lihat Pesanan"}
          </span>
        </Button>
      </div>

      {/* Tablet (640px-1023px) floating cart button */}
      <div className="fixed right-5 bottom-5 z-30 hidden sm:block lg:hidden">
        <Button
          type="button"
          size="lg"
          onClick={() => onOpenChange(true)}
          className="h-14 gap-2.5 rounded-2xl px-5 text-base font-bold shadow-lg"
        >
          <ShoppingBag className="size-5" aria-hidden="true" />
          <span>Pesanan</span>
          <Badge className="rounded-full bg-card px-2 text-xs font-extrabold text-foreground">
            {cart.itemCount}
          </Badge>
        </Button>
      </div>

      {/* Single responsive Sheet so mobile & tablet never portal simultaneously */}
      <Sheet open={open && tier !== "desktop"} onOpenChange={onOpenChange}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={
            isMobile
              ? "flex max-h-[88vh] flex-col rounded-t-2xl bg-background px-4 pt-6 pb-6 lg:hidden"
              : "flex w-full flex-col bg-background p-5 sm:max-w-md lg:hidden"
          }
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Keranjang Pesanan</SheetTitle>
          </SheetHeader>
          {cartElement}
        </SheetContent>
      </Sheet>
    </>
  );
}
