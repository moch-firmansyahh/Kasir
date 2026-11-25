"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, FolderOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  calculateScaledDimensions,
  JPEG_QUALITY,
  MAX_IMAGE_SIDE_PX,
} from "@/lib/image";

type CameraCaptureDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (file: File) => void;
  onFallbackToFile?: () => void;
};

function hasCameraSupport() {
  return typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);
}

function CameraCaptureBody({
  onClose,
  onCapture,
  onFallbackToFile,
}: {
  onClose: () => void;
  onCapture: (file: File) => void;
  onFallbackToFile?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<"starting" | "ready" | "error">(() =>
    hasCameraSupport() ? "starting" : "error"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(() =>
    hasCameraSupport()
      ? null
      : "Kamera langsung tidak didukung di browser atau koneksi ini."
  );
  const [capturing, setCapturing] = useState(false);

  function stopStream() {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  useEffect(() => {
    if (!hasCameraSupport()) return;

    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      })
      .then((stream) => {
        if (cancelled) {
          for (const track of stream.getTracks()) track.stop();
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus("ready");
        setErrorMessage(null);
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(
          "Kamera tidak dapat diakses. Periksa izin kamera atau pilih foto dari file."
        );
      });

    return () => {
      cancelled = true;
      stopStream();
    };
  }, []);

  function handleTakePhoto() {
    const video = videoRef.current;
    if (!video || video.videoWidth <= 0 || video.videoHeight <= 0 || capturing) {
      return;
    }

    setCapturing(true);
    const { width, height } = calculateScaledDimensions(
      video.videoWidth,
      video.videoHeight,
      MAX_IMAGE_SIDE_PX
    );

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      setCapturing(false);
      setStatus("error");
      setErrorMessage("Browser gagal memproses tangkapan kamera.");
      return;
    }

    ctx.drawImage(video, 0, 0, width, height);
    canvas.toBlob(
      (blob) => {
        setCapturing(false);
        if (!blob) {
          setStatus("error");
          setErrorMessage("Foto gagal diambil. Coba lagi.");
          return;
        }
        const capturedFile = new File([blob], "proof.jpg", {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
        stopStream();
        onClose();
        onCapture(capturedFile);
      },
      "image/jpeg",
      JPEG_QUALITY
    );
  }

  return (
    <>
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-border bg-muted/60">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="size-full object-cover"
        />

        {status === "starting" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/80 p-4 text-center text-sm font-semibold text-muted-foreground">
            <Loader2 className="size-6 animate-spin" aria-hidden="true" />
            <span>Membuka kamera...</span>
          </div>
        ) : null}

        {status === "error" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted p-6 text-center">
            <Camera className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-semibold text-foreground">
              {errorMessage ?? "Kamera tidak tersedia."}
            </p>
            {onFallbackToFile ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onClose();
                  onFallbackToFile();
                }}
                className="min-h-11 gap-2 rounded-xl bg-card font-bold"
              >
                <FolderOpen className="size-4" aria-hidden="true" />
                <span>Pilih Dari File</span>
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="min-h-11 rounded-xl font-bold"
        >
          Batal
        </Button>
        <Button
          type="button"
          disabled={status !== "ready" || capturing}
          onClick={handleTakePhoto}
          className="min-h-11 gap-2 rounded-xl font-extrabold"
        >
          {capturing ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Camera className="size-4" aria-hidden="true" />
          )}
          <span>{capturing ? "Menyimpan..." : "Ambil Foto"}</span>
        </Button>
      </DialogFooter>
    </>
  );
}

/**
 * Live camera capture modal using MediaDevices getUserMedia with safe fallback to file picker.
 */
export function CameraCaptureDialog({
  open,
  onOpenChange,
  onCapture,
  onFallbackToFile,
}: CameraCaptureDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold">
            Foto Bukti Bayar
          </DialogTitle>
          <DialogDescription>
            Arahkan kamera ke struk atau bukti pembayaran lalu tekan Ambil Foto.
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <CameraCaptureBody
            onClose={() => onOpenChange(false)}
            onCapture={onCapture}
            onFallbackToFile={onFallbackToFile}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
