"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CloudUpload,
  Loader2,
  RotateCw,
  Trash2,
  WifiOff,
} from "lucide-react";
import { Money } from "@/components/shared/Money";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatJamWIB } from "@/lib/format";
import type { QueuedOrderRecord } from "@/lib/offline/orderQueue";
import { cn } from "@/lib/utils";

type OfflineQueueBarProps = {
  isOnline: boolean;
  queuedOrders: QueuedOrderRecord[];
  flushing: boolean;
  onFlush: (includeErrors?: boolean) => void;
  onRetryOne: (localId: string) => void;
  onRemoveOne: (localId: string) => void;
};

export function OfflineQueueBar({
  isOnline,
  queuedOrders,
  flushing,
  onFlush,
  onRetryOne,
  onRemoveOne,
}: OfflineQueueBarProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const pendingCount = queuedOrders.filter(
    (q) => q.status === "pending" || q.status === "syncing"
  ).length;
  const errorCount = queuedOrders.filter((q) => q.status === "error").length;

  if (isOnline && queuedOrders.length === 0) {
    return null;
  }

  return (
    <>
      <div
        role="status"
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm",
          !isOnline || errorCount > 0
            ? "border-brand-yellow bg-brand-yellow/20 text-foreground"
            : "border-border bg-card text-foreground"
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          {!isOnline ? (
            <WifiOff className="size-4 shrink-0 text-foreground" aria-hidden="true" />
          ) : errorCount > 0 ? (
            <AlertTriangle
              className="size-4 shrink-0 text-destructive"
              aria-hidden="true"
            />
          ) : (
            <CloudUpload className="size-4 shrink-0 text-primary" aria-hidden="true" />
          )}

          <div className="min-w-0 space-y-0.5">
            <p className="font-bold leading-snug">
              {!isOnline
                ? "Mode Offline — pesanan baru masuk antrean perangkat"
                : `${queuedOrders.length} pesanan di antrean offline`}
            </p>
            {queuedOrders.length > 0 ? (
              <p className="text-xs text-muted-foreground">
                {pendingCount > 0 ? `${pendingCount} menunggu dikirim` : ""}
                {pendingCount > 0 && errorCount > 0 ? " · " : ""}
                {errorCount > 0 ? `${errorCount} perlu dicek` : ""}
              </p>
            ) : null}
          </div>
        </div>

        {queuedOrders.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(true)}
              className="min-h-11 rounded-xl bg-card px-3.5 text-xs font-bold"
            >
              Lihat Antrean ({queuedOrders.length})
            </Button>

            <Button
              type="button"
              disabled={!isOnline || flushing}
              onClick={() => onFlush(true)}
              className="min-h-11 gap-1.5 rounded-xl px-4 text-xs font-extrabold"
            >
              {flushing ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <RotateCw className="size-4" aria-hidden="true" />
              )}
              <span>{flushing ? "Mengirim..." : "Kirim Sekarang"}</span>
            </Button>
          </div>
        ) : null}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">
              Antrean Pesanan Offline ({queuedOrders.length})
            </DialogTitle>
            <DialogDescription>
              Pesanan dikirim otomatis ke dapur saat koneksi internet kembali stabil.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-1 py-1">
            {queuedOrders.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Semua antrean offline sudah terkirim.
              </p>
            ) : (
              queuedOrders.map((item) => (
                <div
                  key={item.localId}
                  className="space-y-2 rounded-xl border border-border bg-card p-3.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-foreground">
                        {item.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatJamWIB(item.createdAt)} · {item.itemCount} item ·{" "}
                        <Money amount={item.previewTotal} className="font-bold text-foreground" />
                      </p>
                    </div>

                    <Badge
                      variant={item.status === "error" ? "destructive" : "outline"}
                      className="shrink-0 font-bold"
                    >
                      {item.status === "syncing"
                        ? "Mengirim..."
                        : item.status === "error"
                          ? "Gagal"
                          : "Menunggu"}
                    </Badge>
                  </div>

                  {item.lastError ? (
                    <p className="rounded-lg bg-destructive/10 px-2.5 py-1.5 text-xs font-medium text-destructive">
                      {item.lastError}
                    </p>
                  ) : null}

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={!isOnline || item.status === "syncing" || flushing}
                      onClick={() => onRetryOne(item.localId)}
                      className="min-h-11 gap-1.5 rounded-xl text-xs font-bold"
                    >
                      <RotateCw className="size-3.5" aria-hidden="true" />
                      <span>Kirim Ulang</span>
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={item.status === "syncing"}
                          className="min-h-11 gap-1.5 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                          <span>Hapus</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Hapus antrean pesanan {item.customerName}?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Pesanan offline ini belum terkirim ke dapur dan akan dihapus dari perangkat.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => onRemoveOne(item.localId)}
                          >
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
