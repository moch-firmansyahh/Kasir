import { describe, expect, it } from "vitest";
import { canTransition } from "@/lib/api";
import {
  formatRupiah,
  formatWaktu,
  formatWaktuRelatif,
  getWibDateRangeIso,
  getWibTodayStartIso,
} from "@/lib/format";
import { calculateScaledDimensions } from "@/lib/image";
import { validateVariantSelection } from "@/lib/validators";

describe("formatRupiah", () => {
  it("formats integer rupiah with space after Rp", () => {
    expect(formatRupiah(15_000)).toBe("Rp 15.000");
    expect(formatRupiah(0)).toBe("Rp 0");
  });
});

describe("formatWaktu & formatWaktuRelatif", () => {
  it("formats WIB time and relative labels", () => {
    const formatted = formatWaktu("2026-11-25T10:00:00.000Z");
    expect(formatted).toContain("17.00");

    const base = new Date("2026-11-25T10:15:00.000Z");
    expect(formatWaktuRelatif("2026-11-25T10:14:40.000Z", base)).toBe("Baru saja");
    expect(formatWaktuRelatif("2026-11-25T10:03:00.000Z", base)).toBe("12 mnt lalu");
  });
});

describe("validateVariantSelection", () => {
  const allowed = ["Mangga", "Anggur", "Sirsak", "Jeruk", "Apel"];

  it("allows no variants when variantPick is 0", () => {
    expect(validateVariantSelection(0, [], [])).toEqual({ valid: true });
    expect(validateVariantSelection(0, ["Mangga"], allowed).valid).toBe(false);
  });

  it("requires exact count and allows repeated flavors (A9)", () => {
    expect(validateVariantSelection(2, ["Mangga", "Mangga"], allowed)).toEqual({
      valid: true,
    });
    expect(validateVariantSelection(2, ["Mangga"], allowed)).toMatchObject({
      valid: false,
      code: "VARIANT_COUNT_INVALID",
    });
  });

  it("rejects unknown variants", () => {
    expect(validateVariantSelection(1, ["Durian"], allowed)).toMatchObject({
      valid: false,
      code: "VARIANT_NOT_ALLOWED",
    });
  });
});

describe("canTransition", () => {
  it("allows forward-only status transitions", () => {
    expect(canTransition("baru", "dimasak")).toBe(true);
    expect(canTransition("dimasak", "selesai")).toBe(true);
    expect(canTransition("baru", "selesai")).toBe(false);
    expect(canTransition("dimasak", "baru")).toBe(false);
    expect(canTransition("selesai", "baru")).toBe(false);
  });
});

describe("calculateScaledDimensions", () => {
  it("scales down longest edge to 800px preserving aspect ratio", () => {
    expect(calculateScaledDimensions(1600, 1200)).toEqual({
      width: 800,
      height: 600,
    });
    expect(calculateScaledDimensions(600, 450)).toEqual({
      width: 600,
      height: 450,
    });
  });
});

describe("getWibTodayStartIso", () => {
  it("computes UTC midnight boundary for Asia/Jakarta (UTC+7)", () => {
    // 2026-11-25 10:00 UTC = 2026-11-25 17:00 WIB -> WIB midnight is 2026-11-24 17:00 UTC
    expect(getWibTodayStartIso(new Date("2026-11-25T10:00:00.000Z"))).toBe(
      "2026-11-24T17:00:00.000Z"
    );
    // 2026-11-25 20:00 UTC = 2026-11-26 03:00 WIB -> WIB midnight is 2026-11-25 17:00 UTC
    expect(getWibTodayStartIso(new Date("2026-11-25T20:00:00.000Z"))).toBe(
      "2026-11-25T17:00:00.000Z"
    );
    expect(getWibDateRangeIso("2026-11-25", "2026-11-25")).toEqual({
      startIso: "2026-11-24T17:00:00.000Z",
      endExclusiveIso: "2026-11-25T17:00:00.000Z",
    });
    expect(getWibDateRangeIso("2026-11-25", "2026-11-24")).toBeNull();
  });
});
