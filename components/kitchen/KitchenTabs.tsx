"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { KitchenTab } from "@/hooks/useKitchenOrders";

type KitchenTabsProps = {
  tab: KitchenTab;
  activeCount: number;
  onTabChange: (tab: KitchenTab) => void;
};

export function KitchenTabs({
  tab,
  activeCount,
  onTabChange,
}: KitchenTabsProps) {
  return (
    <Tabs
      value={tab}
      onValueChange={(value) => onTabChange(value as KitchenTab)}
    >
      <TabsList className="grid w-full max-w-sm grid-cols-2 rounded-xl bg-muted p-1 group-data-horizontal/tabs:h-12">
        <TabsTrigger
          value="active"
          className="h-10 rounded-lg text-sm font-bold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
        >
          Aktif ({activeCount})
        </TabsTrigger>
        <TabsTrigger
          value="done"
          className="h-10 rounded-lg text-sm font-bold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
        >
          Selesai
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
