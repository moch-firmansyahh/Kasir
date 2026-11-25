"use client";

import { AlertTriangle, Loader2, RotateCw, ShoppingBag, Trash2, X } from "lucide-react";
import { CartItem } from "@/components/pos/CartItem";
import { DiscountInput } from "@/components/pos/DiscountInput";
import { OrderMeta } from "@/components/pos/OrderMeta";
import { PaymentPanel } from "@/components/pos/PaymentPanel";
import { ProofCapture } from "@/components/pos/ProofCapture";
import { Summary } from "@/components/pos/Summary";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { useCart } from "@/hooks/useCart";

export type PendingProofRetry = {
  orderId: string;
  orderNo: number;
  file: File;
};

type CartProps = {
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

export function Cart({
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
}: CartProps) {
  const canSubmit =
    cart.lines.length > 0 &&
    Boolean(cart.paymentMethod) &&
    !cart.discountError &&
    !submitting;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 pb-3">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-xl font-bold text-foreground">
            Pesanan baru
          </h2>
          {cart.itemCount > 0 ? (
            <Badge className="rounded-full bg-brand-yellow px-2.5 text-xs font-bold text-foreground">
              {cart.itemCount}
            </Badge>
          ) : null}
        </div>

        {cart.lines.length > 0 ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={submitting}
                className="min-h-10 gap-1.5 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                <span>Kosongkan</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Kosongkan keranjang?</AlertDialogTitle>
                <AlertDialogDescription>
                  Semua item dan catatan di keranjang saat ini akan dihapus.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => {
                    cart.clearCart();
                    onProofFileChange(null);
                  }}
                >
                  Kosongkan
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </div>

      {retryProof ? (
        <div
          role="alert"
          className="mb-3 space-y-2 rounded-xl border border-brand-yellow bg-brand-yellow/20 p-3 text-xs"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden="true" />
              <p className="font-semibold text-foreground">
                Pesanan #{retryProof.orderNo} tersimpan, tetapi foto gagal diunggah.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onDismissRetryProof}
              aria-label="Tutup peringatan foto"
              className="size-11 shrink-0 rounded-xl"
            >
              <X className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={retryingProof}
            onClick={onRetryProof}
            className="h-9 w-full gap-1.5 rounded-lg bg-card font-bold"
          >
            {retryingProof ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <RotateCw className="size-3.5" aria-hidden="true" />
            )}
            <span>{retryingProof ? "Mengunggah..." : "Coba lagi unggah foto"}</span>
          </Button>
        </div>
      ) : null}

      {cart.lines.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-8">
          <EmptyState
            icon={ShoppingBag}
            title="Keranjang kosong. Pilih menu untuk mulai."
            className="w-full border-border/80 bg-card/50"
          />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <ScrollArea className="min-h-0 flex-1 pr-2">
            <div className="space-y-3 pb-2">
              <OrderMeta
                orderType={cart.orderType}
                customerName={cart.customerName}
                tableNo={cart.tableNo}
                orderNote={cart.orderNote}
                onOrderTypeChange={cart.setOrderType}
                onCustomerNameChange={cart.setCustomerName}
                onTableNoChange={cart.setTableNo}
                onOrderNoteChange={cart.setOrderNote}
              />

              <Separator className="bg-border" />

              <div className="space-y-2">
                {cart.lines.map((line) => (
                  <CartItem
                    key={line.key}
                    line={line}
                    invalid={cart.invalidMenuIds.includes(line.menuItemId)}
                    onUpdateQty={cart.updateQty}
                    onSetNote={cart.setLineNote}
                    onRemove={cart.removeLine}
                  />
                ))}
              </div>

              <Separator className="bg-border" />

              <DiscountInput
                discountType={cart.discountType}
                discountInput={cart.discountInput}
                error={cart.discountError}
                onTypeChange={cart.setDiscountType}
                onInputChange={cart.setDiscountInput}
              />

              <Summary totals={cart.totals} taxPercent={taxPercent} />

              <PaymentPanel
                paymentMethod={cart.paymentMethod}
                cashReceivedInput={cart.cashReceivedInput}
                total={cart.totals.total}
                onSelectMethod={cart.setPaymentMethod}
                onCashReceivedChange={cart.setCashReceivedInput}
              />

              <ProofCapture
                file={proofFile}
                disabled={submitting}
                onChange={onProofFileChange}
              />
            </div>
          </ScrollArea>

          {submitError ? (
            <p
              role="alert"
              className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive"
            >
              {submitError}
            </p>
          ) : null}

          <Button
            type="button"
            size="lg"
            disabled={!canSubmit}
            onClick={onSubmitOrder}
            className="h-14 w-full shrink-0 gap-2 rounded-xl text-base font-extrabold shadow-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                <span>Mengirim pesanan...</span>
              </>
            ) : (
              <span>Buat Pesanan</span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
