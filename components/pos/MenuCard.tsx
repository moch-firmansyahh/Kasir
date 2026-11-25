"use client";

import Image from "next/image";
import { Plus, UtensilsCrossed } from "lucide-react";
import { Money } from "@/components/shared/Money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { MenuItemDTO } from "@/types/api";

type MenuCardProps = {
  item: MenuItemDTO;
  onSelect: (item: MenuItemDTO) => void;
};

export function MenuCard({ item, onSelect }: MenuCardProps) {
  return (
    <Card
      onClick={() => onSelect(item)}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-card p-0 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md active:scale-[0.98]"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted/60">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover object-[50%_58%] transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-muted/50 text-muted-foreground">
            <UtensilsCrossed className="size-8" aria-hidden="true" />
          </div>
        )}
        {item.variantPick > 0 ? (
          <Badge className="absolute top-2 left-2 rounded-lg border-transparent bg-brand-yellow px-2 py-0.5 text-xs font-bold text-foreground shadow-xs">
            Pilih {item.variantPick}
          </Badge>
        ) : null}
      </div>

      <CardContent className="flex flex-1 flex-col justify-between gap-2 p-3">
        <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-snug text-foreground sm:text-base">
          {item.name}
        </h3>

        <div className="flex items-center justify-between gap-2">
          <Money
            amount={item.price}
            className="text-sm font-extrabold text-foreground sm:text-base"
          />
          <Button
            type="button"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item);
            }}
            aria-label={`Tambah ${item.name}`}
            className="size-11 shrink-0 rounded-full bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
          >
            <Plus className="size-5" aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
