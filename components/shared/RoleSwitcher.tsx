"use client";

import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RoleSwitcherProps = {
  compact?: boolean;
  className?: string;
};

/**
 * Navigates back to the role selection screen ("/").
 */
export function RoleSwitcher({ compact = false, className }: RoleSwitcherProps) {
  return (
    <Button
      asChild
      variant="outline"
      size="default"
      className={cn(
        "min-h-11 justify-start overflow-hidden rounded-xl border-border bg-card text-foreground hover:bg-muted",
        compact ? "px-3.5" : "gap-2.5 px-3.5",
        className
      )}
    >
      <Link href="/" prefetch={false} aria-label="Ganti Role" title="Ganti Role">
        <ArrowLeftRight className="size-4 shrink-0" aria-hidden="true" />
        <span
          aria-hidden={compact}
          className={cn(
            "whitespace-nowrap transition-opacity duration-150",
            compact ? "pointer-events-none opacity-0" : "opacity-100"
          )}
        >
          Ganti Role
        </span>
      </Link>
    </Button>
  );
}
