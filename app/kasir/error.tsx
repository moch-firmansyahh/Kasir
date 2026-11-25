"use client";

import { RouteErrorView } from "@/components/shared/RouteErrorView";

export default function KasirError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorView
      error={error}
      reset={reset}
      title="Halaman Kasir mengalami kendala"
      homeHref="/kasir"
      homeLabel="Muat Ulang Kasir"
    />
  );
}
