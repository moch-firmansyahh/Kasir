"use client";

import { useEffect, useMemo } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { ProofSourcePicker } from "@/components/shared/ProofSourcePicker";
import { Button } from "@/components/ui/button";

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
  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-foreground">
        Foto Bukti Bayar{" "}
        <span className="font-medium text-muted-foreground">(opsional)</span>
      </p>

      {!file ? (
        <ProofSourcePicker
          disabled={disabled}
          mode="buttons"
          onImageReady={(compressed) => onChange(compressed)}
        />
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
            <ProofSourcePicker
              disabled={disabled}
              mode="dropdown"
              triggerLabel=""
              triggerAriaLabel="Ganti foto bukti bayar"
              triggerIcon={<RefreshCw className="size-4" aria-hidden="true" />}
              onImageReady={(compressed) => onChange(compressed)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled}
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
