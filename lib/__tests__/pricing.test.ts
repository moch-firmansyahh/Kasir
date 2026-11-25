import { describe, expect, it } from "vitest";
import { calculateTotals } from "@/lib/pricing";

describe("calculateTotals", () => {
  it("computes subtotal and total without discount or tax", () => {
    expect(
      calculateTotals({
        lines: [{ price: 15_000, qty: 2 }],
        taxPercent: 0,
      })
    ).toEqual({
      subtotal: 30_000,
      discount: 0,
      tax: 0,
      total: 30_000,
    });
  });

  it("computes percent discount", () => {
    expect(
      calculateTotals({
        lines: [{ price: 38_000, qty: 1 }],
        discount: { type: "percent", value: 10 },
        taxPercent: 0,
      })
    ).toEqual({
      subtotal: 38_000,
      discount: 3_800,
      tax: 0,
      total: 34_200,
    });
  });

  it("computes fixed amount discount", () => {
    expect(
      calculateTotals({
        lines: [{ price: 38_000, qty: 1 }],
        discount: { type: "amount", value: 5_000 },
        taxPercent: 0,
      })
    ).toEqual({
      subtotal: 38_000,
      discount: 5_000,
      tax: 0,
      total: 33_000,
    });
  });

  it("computes tax on subtotal when no discount", () => {
    expect(
      calculateTotals({
        lines: [{ price: 38_000, qty: 1 }],
        taxPercent: 11,
      })
    ).toEqual({
      subtotal: 38_000,
      discount: 0,
      tax: 4_180,
      total: 42_180,
    });
  });

  it("computes tax after discount (discount + tax)", () => {
    expect(
      calculateTotals({
        lines: [{ price: 38_000, qty: 1 }],
        discount: { type: "percent", value: 10 },
        taxPercent: 11,
      })
    ).toEqual({
      subtotal: 38_000,
      discount: 3_800,
      tax: 3_762,
      total: 37_962,
    });
  });

  it("rounds consistently using Math.round", () => {
    expect(
      calculateTotals({
        lines: [{ price: 9_999, qty: 1 }],
        discount: { type: "percent", value: 10 },
        taxPercent: 0,
      })
    ).toEqual({
      subtotal: 9_999,
      discount: 1_000,
      tax: 0,
      total: 8_999,
    });
  });

  it("returns all zeros for empty lines", () => {
    expect(
      calculateTotals({
        lines: [],
        discount: { type: "amount", value: 5_000 },
        taxPercent: 11,
      })
    ).toEqual({
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
    });
  });
});
