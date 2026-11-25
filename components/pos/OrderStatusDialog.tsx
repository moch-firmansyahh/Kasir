"use client";

import {
  AlertTriangle,
  CheckCircle2,
  CloudUpload,
  Loader2,
  RotateCw,
  XCircle,
} from "lucide-react";
import { Money } from "@/components/shared/Money";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PaymentMethod } from "@/types/db";

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cash: "Tunai",
  qris: "QRIS",
  transfer: "Transfer",
};

export type OrderFeedbackState =
  | {
      kind: "success";
      orderNo: number;
      customerName: string;
      itemCount: number;
      total: number;
      paymentMethod: PaymentMethod;
      hasProof: boolean;
    }
  | {
      kind: "partial_proof";
      orderNo: number;
      customerName: string;
      itemCount: number;
      total: number;
      paymentMethod: PaymentMethod;
    }
  | {
      kind: "queued";
      customerName: string;
      itemCount: number;
      previewTotal: number;
      paymentMethod: PaymentMethod;
    }
  | {
      kind: "error";
      message: string;
    };

type OrderStatusDialogProps = {
  feedback: OrderFeedbackState | null;
  retryingProof?: boolean;
  hasRetryProof?: boolean;
  onRetryProof?: () => void;
  onClose: () => void;
};

export function OrderStatusDialog({
  feedback,
  retryingProof = false,
  hasRetryProof = false,
  onRetryProof,
  onClose,
}: OrderStatusDialogProps) {
  if (!feedback) return null;

  const isSuccess = feedback.kind === "success";
  const isPartial = feedback.kind === "partial_proof";
  const isQueued = feedback.kind === "queued";
  const isError = feedback.kind === "error";

  const title = isSuccess
    ? `Pesanan #${feedback.orderNo} Berhasil!`
    : isPartial
      ? `Pesanan #${feedback.orderNo} Tersimpan`
      : isQueued
        ? "Masuk Antrean Offline"
        : "Pesanan Gagal Dikirim";

  const description = isSuccess
    ? "Pesanan sudah masuk ke sistem dan langsung diteruskan ke Dapur."
    : isPartial
      ? "Pesanan sudah masuk ke Dapur, tetapi foto bukti bayar gagal diunggah."
      : isQueued
        ? "Sinyal sedang terputus. Pesanan disimpan aman di perangkat dan akan dikirim otomatis saat koneksi kembali."
        : feedback.message;

  return (
    <Dialog open={Boolean(feedback)} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader className="items-center text-center sm:items-center sm:text-center">
          <div
            className={
              isSuccess
                ? "mb-2 flex size-14 items-center justify-center rounded-full bg-brand-teal/15 text-brand-teal"
                : isError
                  ? "mb-2 flex size-14 items-center justify-center rounded-full bg-destructive/15 text-destructive"
                  : "mb-2 flex size-14 items-center justify-center rounded-full bg-brand-yellow/25 text-foreground"
            }
          >
            {isSuccess ? (
              <CheckCircle2 className="size-8" aria-hidden="true" />
            ) : isPartial ? (
              <AlertTriangle className="size-8" aria-hidden="true" />
            ) : isQueued ? (
              <CloudUpload className="size-8" aria-hidden="true" />
            ) : (
              <XCircle className="size-8" aria-hidden="true" />
            )}
          </div>

          <DialogTitle className="font-display text-2xl font-extrabold text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        {!isError ? (
          <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-3.5 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Nama customer</span>
              <span className="font-bold text-foreground">
                {feedback.customerName}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Jumlah item</span>
              <span className="font-bold text-foreground tabular-nums">
                {feedback.itemCount} item
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Metode bayar</span>
              <span className="font-bold text-foreground">
                {PAYMENT_LABEL[feedback.paymentMethod]}
              </span>
            </div>
            <div className="flex justify-between gap-2 border-t border-border pt-2">
              <span className="font-semibold text-foreground">
                {isQueued ? "Perkiraan total" : "Total bayar"}
              </span>
              <Money
                amount={isQueued ? feedback.previewTotal : feedback.total}
                className="font-extrabold text-foreground"
              />
            </div>
            {isSuccess && feedback.hasProof ? (
              <p className="pt-1 text-xs font-semibold text-brand-teal">
                Foto bukti bayar berhasil tersimpan.
              </p>
            ) : null}
          </div>
        ) : (
          <p className="rounded-xl border border-border bg-muted/40 p-3 text-center text-xs font-medium text-muted-foreground">
            Keranjang Anda tetap aman. Silakan periksa pesanan lalu coba kirim ulang.
          </p>
        )}

        <DialogFooter className="gap-2 sm:justify-center">
          {isPartial && hasRetryProof && onRetryProof ? (
            <Button
              type="button"
              variant="outline"
              disabled={retryingProof}
              onClick={onRetryProof}
              className="min-h-11 gap-2 rounded-xl font-bold"
            >
              {retryingProof ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <RotateCw className="size-4" aria-hidden="true" />
              )}
              <span>
                {retryingProof ? "Mengunggah..." : "Coba Lagi Unggah Foto"}
              </span>
            </Button>
          ) : null}

          <Button
            type="button"
            onClick={onClose}
            className="min-h-11 w-full rounded-xl text-base font-extrabold sm:min-w-44"
          >
            {isError ? "Periksa Keranjang" : "Oke, Mengerti"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
