"use client";

import { forwardRef } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  function SearchBar({ value, onChange, className }, ref) {
    return (
      <div className={cn("relative flex items-center", className)}>
        <Search
          className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          ref={ref}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Cari menu..."
          aria-label="Cari menu..."
          className="h-11 rounded-xl border-border bg-card pl-10 pr-11 text-sm text-foreground placeholder:text-muted-foreground"
        />
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange("")}
            aria-label="Hapus pencarian"
            className="absolute right-0 size-11 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    );
  }
);
