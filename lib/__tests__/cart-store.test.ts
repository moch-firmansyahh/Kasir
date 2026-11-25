import { beforeEach, describe, expect, it } from "vitest";
import { calculateTotals } from "@/lib/pricing";
import {
  buildCartLineKey,
  parseCartDiscount,
  useCartStore,
} from "@/lib/store/cart";

describe("useCartStore", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it("merges identical menu + sorted variants + note into a single line (T1)", () => {
    const store = useCartStore.getState();
    store.addItem({
      menuItemId: "mix-platter",
      name: "Mix Platter",
      price: 15_000,
      variants: ["Sosis", "Kentang", "Nugget"],
    });
    store.addItem({
      menuItemId: "mix-platter",
      name: "Mix Platter",
      price: 15_000,
      variants: ["Kentang", "Nugget", "Sosis"],
    });

    const { lines } = useCartStore.getState();
    expect(lines).toHaveLength(1);
    expect(lines[0].qty).toBe(2);
    expect(lines[0].variants).toEqual(["Kentang", "Nugget", "Sosis"]);

    const totals = calculateTotals({
      lines: lines.map((l) => ({ price: l.price, qty: l.qty })),
      taxPercent: 0,
    });
    expect(totals.total).toBe(30_000);
  });

  it("keeps separate lines when item notes differ and updates/removes qty cleanly", () => {
    const store = useCartStore.getState();
    store.addItem({
      menuItemId: "single-cemul",
      name: "Single Cemul",
      price: 9_000,
      variants: ["Mangga"],
      note: "Sedikit es",
    });
    store.addItem({
      menuItemId: "single-cemul",
      name: "Single Cemul",
      price: 9_000,
      variants: ["Mangga"],
    });

    expect(useCartStore.getState().lines).toHaveLength(2);

    const noNoteKey = buildCartLineKey("single-cemul", ["Mangga"], "");
    store.updateQty(noNoteKey, -1);
    expect(useCartStore.getState().lines).toHaveLength(1);
  });

  it("merges lines when setLineNote makes two lines identical", () => {
    const store = useCartStore.getState();
    store.addItem({
      menuItemId: "toast",
      name: "French Toast",
      price: 13_000,
      variants: ["Coklat"],
      note: "Extra manis",
    });
    store.addItem({
      menuItemId: "toast",
      name: "French Toast",
      price: 13_000,
      variants: ["Coklat"],
    });

    const plainKey = buildCartLineKey("toast", ["Coklat"], "");
    store.setLineNote(plainKey, "Extra manis");

    const { lines } = useCartStore.getState();
    expect(lines).toHaveLength(1);
    expect(lines[0].qty).toBe(2);
  });

  it("truncates customerName to 60 characters and resets it on clearCart", () => {
    const store = useCartStore.getState();
    store.setCustomerName("A".repeat(80));
    expect(useCartStore.getState().customerName).toHaveLength(60);
    store.clearCart();
    expect(useCartStore.getState().customerName).toBe("");
  });
});

describe("parseCartDiscount & POS total scenarios (T3-T5)", () => {
  it("computes T3: 10% discount on 38.000, tax 0 -> 34.200", () => {
    const { discount, error } = parseCartDiscount("percent", "10", 38_000);
    expect(error).toBeNull();
    expect(
      calculateTotals({
        lines: [{ price: 38_000, qty: 1 }],
        discount,
        taxPercent: 0,
      }).total
    ).toBe(34_200);
  });

  it("rejects T4: fixed discount exceeding subtotal", () => {
    const { discount, error } = parseCartDiscount("amount", "40000", 38_000);
    expect(discount).toBeNull();
    expect(error).toBe("Diskon nominal tidak boleh melebihi subtotal");
  });

  it("computes T5: tax 11% on 38.000 without discount -> tax 4.180, total 42.180", () => {
    const { discount, error } = parseCartDiscount("percent", "", 38_000);
    expect(error).toBeNull();
    expect(
      calculateTotals({
        lines: [{ price: 38_000, qty: 1 }],
        discount,
        taxPercent: 11,
      })
    ).toEqual({
      subtotal: 38_000,
      discount: 0,
      tax: 4_180,
      total: 42_180,
    });
  });
});
