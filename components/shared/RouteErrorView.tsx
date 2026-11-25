"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type RouteErrorViewProps = {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  homeHref?: string;
  homeLabel?: string;
};

/**
 * Shared Indonesian error boundary UI for Next.js route error segments.
 */
export function RouteErrorView({
  error,
  reset,
  title = "Terjadi kendala saat membuka halaman",
  homeHref = "/",
  homeLabel = "Kembali ke Beranda",
}: RouteErrorViewProps) {
  useEffect(() => {
    console.error("Route error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-md rounded-2xl border-border bg-card shadow-sm">
        <CardContent className="flex flex-col items-center space-y-4 p-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <AlertTriangle className="size-7" aria-hidden="true" />
          </div>

          <div className="space-y-1.5">
            <h1 className="font-display text-2xl font-extrabold text-foreground">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">
              Periksa koneksi internet Anda lalu coba muat ulang halaman. Data pesanan yang tersimpan tetap aman.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              onClick={reset}
              className="min-h-11 flex-1 gap-2 rounded-xl font-bold"
            >
              <RotateCw className="size-4" aria-hidden="true" />
              <span>Coba lagi</span>
            </Button>

            <Button
              asChild
              variant="outline"
              className="min-h-11 flex-1 gap-2 rounded-xl font-bold"
            >
              <Link href={homeHref}>
                <Home className="size-4" aria-hidden="true" />
                <span>{homeLabel}</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
