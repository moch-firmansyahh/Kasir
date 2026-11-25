"use client";

import { useRef, useState } from "react";
import { Camera, FolderOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CameraCaptureDialog } from "@/components/shared/CameraCaptureDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { compressImageFile } from "@/lib/image";
import { cn } from "@/lib/utils";
import { MAX_UPLOAD_BYTES } from "@/lib/validators";

type ProofSourcePickerProps = {
  busy?: boolean;
  disabled?: boolean;
  mode?: "buttons" | "dropdown";
  triggerLabel?: string;
  triggerIcon?: React.ReactNode;
  triggerAriaLabel?: string;
  className?: string;
  onImageReady: (file: File) => Promise<void> | void;
};

/**
 * Provides both "Dari File" (file explorer/gallery) and "Foto Langsung" (live camera or mobile capture).
 */
export function ProofSourcePicker({
  busy = false,
  disabled = false,
  mode = "buttons",
  triggerLabel = "Ganti",
  triggerIcon,
  triggerAriaLabel,
  className,
  onImageReady,
}: ProofSourcePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);
  const [cameraDialogOpen, setCameraDialogOpen] = useState(false);

  const isBusy = busy || compressing;

  async function processFile(rawFile: File) {
    setCompressing(true);
    try {
      const compressed = await compressImageFile(rawFile);
      if (compressed.size > MAX_UPLOAD_BYTES) {
        toast.error("Ukuran foto masih melebihi 2 MB. Pilih foto lain.");
        return;
      }
      await onImageReady(compressed);
    } catch {
      toast.error("Foto gagal diproses. Coba pilih gambar lain.");
    } finally {
      setCompressing(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    e.target.value = "";
    if (!selected) return;
    void processFile(selected);
  }

  function handlePickFromFile() {
    fileInputRef.current?.click();
  }

  function handleDirectPhoto() {
    const isTouchPrimary =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;

    if (!isTouchPrimary && typeof navigator !== "undefined" && Boolean(navigator.mediaDevices)) {
      setCameraDialogOpen(true);
      return;
    }

    cameraInputRef.current?.click();
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        aria-label="Pilih bukti bayar dari file"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
        aria-label="Ambil foto bukti bayar langsung"
      />

      {mode === "dropdown" ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size={triggerLabel ? "sm" : "icon"}
              disabled={disabled || isBusy}
              aria-label={triggerAriaLabel ?? triggerLabel ?? "Pilih sumber foto"}
              className={cn(
                triggerLabel
                  ? "min-h-11 gap-1.5 rounded-xl font-bold"
                  : "size-11 rounded-xl",
                className
              )}
            >
              {isBusy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                triggerIcon
              )}
              {triggerLabel ? <span>{triggerLabel}</span> : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5">
            <DropdownMenuItem
              onSelect={handlePickFromFile}
              className="min-h-11 cursor-pointer gap-2.5 rounded-lg font-semibold"
            >
              <FolderOpen className="size-4" aria-hidden="true" />
              <span>Dari File</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={handleDirectPhoto}
              className="min-h-11 cursor-pointer gap-2.5 rounded-lg font-semibold"
            >
              <Camera className="size-4" aria-hidden="true" />
              <span>Foto Langsung</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className={cn("grid grid-cols-2 gap-2", className)}>
          <Button
            type="button"
            variant="outline"
            disabled={disabled || isBusy}
            onClick={handlePickFromFile}
            className="min-h-11 justify-center gap-2 rounded-xl border-dashed border-border bg-card px-3 text-xs font-bold text-foreground hover:bg-muted/60"
          >
            {isBusy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <FolderOpen className="size-4 shrink-0" aria-hidden="true" />
            )}
            <span>Dari File</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={disabled || isBusy}
            onClick={handleDirectPhoto}
            className="min-h-11 justify-center gap-2 rounded-xl border-dashed border-border bg-card px-3 text-xs font-bold text-foreground hover:bg-muted/60"
          >
            {isBusy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Camera className="size-4 shrink-0" aria-hidden="true" />
            )}
            <span>Foto Langsung</span>
          </Button>
        </div>
      )}

      <CameraCaptureDialog
        open={cameraDialogOpen}
        onOpenChange={setCameraDialogOpen}
        onCapture={(capturedFile) => {
          void processFile(capturedFile);
        }}
        onFallbackToFile={handlePickFromFile}
      />
    </>
  );
}
