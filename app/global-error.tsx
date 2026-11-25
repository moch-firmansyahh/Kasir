"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <html lang="id">
      <body className="flex min-h-screen items-center justify-center bg-background p-6 font-sans text-foreground">
        <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold">Terjadi gangguan aplikasi</h1>
          <p className="text-sm text-muted-foreground">
            Silakan muat ulang halaman. Bila masalah berlanjut, periksa koneksi internet perangkat.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="min-h-11 flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
            >
              Coba lagi
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-11 flex-1 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-foreground"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
