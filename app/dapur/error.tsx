"use client";

import { RouteErrorView } from "@/components/shared/RouteErrorView";

export default function DapurError({
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
      title="Layar Dapur mengalami kendala"
      homeHref="/"
      homeLabel="Ganti Role"
    />
  );
}
