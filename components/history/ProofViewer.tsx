"use client";

import { useState } from "react";
import Image from "next/image";
import { Expand, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ProofSourcePicker } from "@/components/shared/ProofSourcePicker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ApiResponse } from "@/types/api";

type ProofViewerProps = {
  orderId: string;
  orderNo: number;
  proofUrl: string | null;
  onUploaded: (nextUrl: string) => void;
};

export function ProofViewer({
  orderId,
  orderNo,
  proofUrl,
  onUploaded,
}: ProofViewerProps) {
  const [uploading, setUploading] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  async function handleUploadProof(compressed: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", compressed);

      const res = await fetch(`/api/orders/${orderId}/proof`, {
        method: "POST",
        body: formData,
      });
      const json = (await res.json()) as ApiResponse<{ paymentProofUrl: string }>;
      if (!res.ok || json.error) {
        toast.error(json.error?.message ?? "Foto gagal diunggah.");
        return;
      }

      onUploaded(json.data.paymentProofUrl);
      toast.success(`Bukti bayar Pesanan #${orderNo} disimpan`);
    } catch {
      toast.error("Foto gagal diproses atau diunggah.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-foreground">Bukti bayar</span>
        {proofUrl ? (
          <ProofSourcePicker
            busy={uploading}
            mode="dropdown"
            triggerLabel={uploading ? "Mengunggah..." : "Ganti bukti bayar"}
            triggerIcon={<RefreshCw className="size-4" aria-hidden="true" />}
            onImageReady={handleUploadProof}
          />
        ) : null}
      </div>

      {proofUrl ? (
        <>
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            aria-label="Perbesar foto bukti bayar"
            className="group relative block h-44 w-full overflow-hidden rounded-xl border border-border bg-muted/40 outline-none focus-visible:ring-3 focus-visible:ring-ring"
          >
            <Image
              src={proofUrl}
              alt={`Bukti bayar Pesanan #${orderNo}`}
              fill
              sizes="(max-width: 640px) 100vw, 400px"
              className="object-contain"
            />
            <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-lg bg-card/90 px-2.5 py-1 text-xs font-bold text-foreground shadow-xs">
              <Expand className="size-3.5" aria-hidden="true" />
              <span>Perbesar</span>
            </span>
          </button>

          <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
            <DialogContent className="rounded-2xl sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-display text-lg font-bold">
                  Bukti Bayar Pesanan #{orderNo}
                </DialogTitle>
              </DialogHeader>
              <div className="relative h-[65vh] w-full overflow-hidden rounded-xl bg-muted/40">
                <Image
                  src={proofUrl}
                  alt={`Bukti bayar Pesanan #${orderNo}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 700px"
                  className="object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <div className="space-y-2.5">
          <p className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground">
            Belum ada foto bukti bayar.
          </p>
          <ProofSourcePicker
            busy={uploading}
            mode="buttons"
            onImageReady={handleUploadProof}
          />
        </div>
      )}
    </div>
  );
}
