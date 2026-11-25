"use client";

import { useMemo } from "react";
import { calculateTotals } from "@/lib/pricing";
import { parseCartDiscount, useCartStore } from "@/lib/store/cart";

export function useCart(taxPercent: number) {
  const store = useCartStore();

  const itemCount = useMemo(
    () => store.lines.reduce((sum, line) => sum + line.qty, 0),
    [store.lines]
  );

  const subtotal = useMemo(
    () => store.lines.reduce((sum, line) => sum + line.price * line.qty, 0),
    [store.lines]
  );

  const { discount, error: discountError } = useMemo(
    () => parseCartDiscount(store.discountType, store.discountInput, subtotal),
    [store.discountType, store.discountInput, subtotal]
  );

  const totals = useMemo(
    () =>
      calculateTotals({
        lines: store.lines.map((l) => ({ price: l.price, qty: l.qty })),
        discount,
        taxPercent,
      }),
    [store.lines, discount, taxPercent]
  );

  return {
    ...store,
    itemCount,
    discount,
    discountError,
    totals,
  };
}
