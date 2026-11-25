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
      size={compact ? "icon-lg" : "default"}
      className={cn(
        "min-h-11 rounded-xl border-border bg-card text-foreground hover:bg-muted",
        compact ? "w-11" : "gap-2 px-3",
        className
      )}
    >
      <Link href="/" aria-label="Ganti Role" title="Ganti Role">
        <ArrowLeftRight className="size-4 shrink-0" aria-hidden="true" />
        {compact ? null : <span>Ganti Role</span>}
      </Link>
    </Button>
  );
}
