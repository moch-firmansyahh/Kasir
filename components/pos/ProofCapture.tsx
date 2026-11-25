"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { compressImageFile } from "@/lib/image";
import { MAX_UPLOAD_BYTES } from "@/lib/validators";

type ProofCaptureProps = {
  file: File | null;
  disabled?: boolean;
  onChange: (file: File | null) => void;
};

export function ProofCapture({
  file,
  disabled = false,
  onChange,
}: ProofCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    e.target.value = "";
    if (!selected) return;

    setCompressing(true);
    try {
      const compressed = await compressImageFile(selected);
      if (compressed.size > MAX_UPLOAD_BYTES) {
        toast.error("Ukuran foto masih melebihi 2 MB. Pilih foto lain.");
        return;
      }
      onChange(compressed);
    } catch {
      toast.error("Foto gagal diproses. Coba pilih gambar lain.");
    } finally {
      setCompressing(false);
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Pilih foto bukti bayar"
      />

      {!file ? (
        <Button
          type="button"
          variant="outline"
          disabled={disabled || compressing}
          onClick={() => inputRef.current?.click()}
          className="h-11 w-full justify-center gap-2 rounded-xl border-dashed border-border bg-card text-sm font-semibold text-foreground hover:bg-muted/60"
        >
          {compressing ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Camera className="size-4" aria-hidden="true" />
          )}
          <span>
            {compressing ? "Memproses foto..." : "Foto Bukti Bayar (opsional)"}
          </span>
        </Button>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5">
          {previewUrl ? (
            // Local object URL preview before upload; next/image not needed for blob URLs
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Pratinjau bukti bayar"
              className="size-12 shrink-0 rounded-lg border border-border object-cover"
            />
          ) : null}

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-foreground">
              Bukti bayar siap diunggah
            </p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {Math.max(1, Math.round(file.size / 1024))} KB (opsional)
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={disabled || compressing}
              onClick={() => inputRef.current?.click()}
              aria-label="Ganti foto bukti bayar"
              title="Ganti"
              className="size-11 rounded-xl"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled || compressing}
              onClick={() => onChange(null)}
              aria-label="Hapus foto bukti bayar"
              title="Hapus"
              className="size-11 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
