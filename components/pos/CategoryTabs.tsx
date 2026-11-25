"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CategoryDTO } from "@/types/api";

type CategoryTabsProps = {
  categories: CategoryDTO[];
  selectedCategoryId: string | "all";
  onSelect: (categoryId: string | "all") => void;
};

export function CategoryTabs({
  categories,
  selectedCategoryId,
  onSelect,
}: CategoryTabsProps) {
  const tabs: { id: string | "all"; name: string }[] = [
    { id: "all", name: "Semua" },
    ...categories.map((c) => ({ id: c.id, name: c.name })),
  ];

  return (
    <div
      role="tablist"
      aria-label="Filter kategori menu"
      className="flex gap-2 overflow-x-auto pb-1"
    >
      {tabs.map((tab) => {
        const active = selectedCategoryId === tab.id;
        return (
          <Button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            variant={active ? "default" : "outline"}
            onClick={() => onSelect(tab.id)}
            className={cn(
              "min-h-11 shrink-0 rounded-xl px-4 text-sm font-bold transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card text-foreground hover:bg-muted"
            )}
          >
            {tab.name}
          </Button>
        );
      })}
    </div>
  );
}
