export type Discount = { type: "percent" | "amount"; value: number } | null;

export type PricingInput = {
  lines: { price: number; qty: number }[];
  discount?: Discount;
  taxPercent: number; // 0..100
};

export type Totals = {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
};

/**
 * Pure server-and-client pricing calculation.
 * Expects integer rupiah prices/quantities and clamps discount to [0, subtotal].
 * Callers must validate input bounds (e.g. discount > subtotal) before calling.
 */
export function calculateTotals({
  lines,
  discount,
  taxPercent,
}: PricingInput): Totals {
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0);

  let discountAmount = 0;
  if (discount) {
    discountAmount =
      discount.type === "percent"
        ? Math.round((subtotal * discount.value) / 100)
        : discount.value;
  }
  discountAmount = Math.min(Math.max(discountAmount, 0), subtotal);

  const taxBase = subtotal - discountAmount;
  const tax = Math.round((taxBase * taxPercent) / 100);
  const total = subtotal - discountAmount + tax;

  return { subtotal, discount: discountAmount, tax, total };
}
