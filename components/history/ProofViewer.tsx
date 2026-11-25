"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Expand, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { compressImageFile } from "@/lib/image";
import { MAX_UPLOAD_BYTES } from "@/lib/validators";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    e.target.value = "";
    if (!selected) return;

    setUploading(true);
    try {
      const compressed = await compressImageFile(selected);
      if (compressed.size > MAX_UPLOAD_BYTES) {
        toast.error("Ukuran foto maksimal 2 MB.");
        return;
      }

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
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Unggah foto bukti bayar"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="min-h-10 gap-1.5 rounded-xl font-bold"
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : proofUrl ? (
            <RefreshCw className="size-4" aria-hidden="true" />
          ) : (
            <Camera className="size-4" aria-hidden="true" />
          )}
          <span>
            {uploading
              ? "Mengunggah..."
              : proofUrl
                ? "Ganti bukti bayar"
                : "Tambah bukti bayar"}
          </span>
        </Button>
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
        <p className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground">
          Belum ada foto bukti bayar.
        </p>
      )}
    </div>
  );
}
