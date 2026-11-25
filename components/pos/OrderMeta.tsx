"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { OrderType } from "@/types/db";

type OrderMetaProps = {
  orderType: OrderType;
  customerName: string;
  tableNo: string;
  orderNote: string;
  onOrderTypeChange: (value: OrderType) => void;
  onCustomerNameChange: (value: string) => void;
  onTableNoChange: (value: string) => void;
  onOrderNoteChange: (value: string) => void;
};

export function OrderMeta({
  orderType,
  customerName,
  tableNo,
  orderNote,
  onOrderTypeChange,
  onCustomerNameChange,
  onTableNoChange,
  onOrderNoteChange,
}: OrderMetaProps) {
  return (
    <div className="space-y-3">
      <Tabs
        value={orderType}
        onValueChange={(value) => onOrderTypeChange(value as OrderType)}
      >
        <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted p-1 group-data-horizontal/tabs:h-12">
          <TabsTrigger
            value="dine_in"
            className="h-10 rounded-lg text-sm font-bold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
          >
            Dine In
          </TabsTrigger>
          <TabsTrigger
            value="take_away"
            className="h-10 rounded-lg text-sm font-bold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
          >
            Take Away
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className={orderType === "dine_in" ? "space-y-1" : "space-y-1 sm:col-span-2"}>
          <Label htmlFor="order-customer-name" className="sr-only">
            Nama customer (opsional)
          </Label>
          <Input
            id="order-customer-name"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            placeholder="Nama customer (opsional)"
            maxLength={60}
            className="h-11 rounded-xl bg-card"
          />
        </div>

        {orderType === "dine_in" ? (
          <div className="space-y-1">
            <Label htmlFor="order-table-no" className="sr-only">
              No. meja (opsional)
            </Label>
            <Input
              id="order-table-no"
              value={tableNo}
              onChange={(e) => onTableNoChange(e.target.value)}
              placeholder="No. meja (opsional)"
              maxLength={10}
              className="h-11 rounded-xl bg-card"
            />
          </div>
        ) : null}
      </div>

      <div className="space-y-1">
        <Label htmlFor="order-note" className="sr-only">
          Catatan (opsional)
        </Label>
        <Textarea
          id="order-note"
          value={orderNote}
          onChange={(e) => onOrderNoteChange(e.target.value)}
          placeholder="Catatan (opsional)"
          maxLength={200}
          rows={2}
          className="min-h-11 resize-none rounded-xl bg-card"
        />
      </div>
    </div>
  );
}
