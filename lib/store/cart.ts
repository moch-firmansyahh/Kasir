import { create } from "zustand";
import type { Discount } from "@/lib/pricing";
import type { DiscountType, OrderType, PaymentMethod } from "@/types/db";

export type CartLine = {
  key: string;
  menuItemId: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  qty: number;
  variants: string[];
  note: string;
};

export type AddCartItemPayload = {
  menuItemId: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  variants?: string[];
  note?: string;
  qty?: number;
};

export function normalizeVariants(variants: string[] = []): string[] {
  return [...variants].sort((a, b) => a.localeCompare(b));
}

/**
 * Deterministic line key: menuItemId + sorted variants + trimmed note.
 * Identical items merge into one row with incremented quantity.
 */
export function buildCartLineKey(
  menuItemId: string,
  variants: string[] = [],
  note = ""
): string {
  const sortedVariants = normalizeVariants(variants);
  const trimmedNote = note.trim();
  return JSON.stringify([menuItemId, sortedVariants, trimmedNote]);
}

export function parseCartDiscount(
  discountType: DiscountType,
  discountInput: string,
  subtotal: number
): { discount: Discount; error: string | null } {
  const trimmed = discountInput.trim();
  if (!trimmed) {
    return { discount: null, error: null };
  }

  if (!/^\d+$/.test(trimmed)) {
    return {
      discount: null,
      error: "Diskon harus berupa angka bulat positif",
    };
  }

  const value = Number.parseInt(trimmed, 10);
  if (value === 0) {
    return { discount: null, error: null };
  }

  if (discountType === "percent" && value > 100) {
    return { discount: null, error: "Diskon persen maksimal 100%" };
  }

  if (discountType === "amount" && value > subtotal) {
    return {
      discount: null,
      error: "Diskon nominal tidak boleh melebihi subtotal",
    };
  }

  return {
    discount: { type: discountType, value },
    error: null,
  };
}

type CartState = {
  lines: CartLine[];
  orderType: OrderType;
  customerName: string;
  tableNo: string;
  orderNote: string;
  discountType: DiscountType;
  discountInput: string;
  paymentMethod: PaymentMethod | null;
  cashReceivedInput: string;
  invalidMenuIds: string[];
  addItem: (payload: AddCartItemPayload) => void;
  updateQty: (key: string, delta: number) => void;
  setLineNote: (key: string, note: string) => void;
  removeLine: (key: string) => void;
  clearCart: () => void;
  setOrderType: (orderType: OrderType) => void;
  setCustomerName: (name: string) => void;
  setTableNo: (tableNo: string) => void;
  setOrderNote: (note: string) => void;
  setDiscountType: (type: DiscountType) => void;
  setDiscountInput: (value: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setCashReceivedInput: (value: string) => void;
  markInvalidMenuId: (menuItemId: string) => void;
  clearInvalidMenuIds: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  lines: [],
  orderType: "dine_in",
  customerName: "",
  tableNo: "",
  orderNote: "",
  discountType: "percent",
  discountInput: "",
  paymentMethod: null,
  cashReceivedInput: "",
  invalidMenuIds: [],

  addItem: (payload) =>
    set((state) => {
      const sortedVariants = normalizeVariants(payload.variants ?? []);
      const trimmedNote = (payload.note ?? "").trim();
      const qtyToAdd = Math.max(1, Math.round(payload.qty ?? 1));
      const key = buildCartLineKey(
        payload.menuItemId,
        sortedVariants,
        trimmedNote
      );

      const existingIndex = state.lines.findIndex((line) => line.key === key);
      if (existingIndex !== -1) {
        const nextLines = [...state.lines];
        const existing = nextLines[existingIndex];
        nextLines[existingIndex] = {
          ...existing,
          name: payload.name,
          price: payload.price,
          imageUrl: payload.imageUrl,
          qty: existing.qty + qtyToAdd,
        };
        return { lines: nextLines };
      }

      return {
        lines: [
          ...state.lines,
          {
            key,
            menuItemId: payload.menuItemId,
            name: payload.name,
            price: payload.price,
            imageUrl: payload.imageUrl ?? null,
            qty: qtyToAdd,
            variants: sortedVariants,
            note: trimmedNote,
          },
        ],
      };
    }),

  updateQty: (key, delta) =>
    set((state) => {
      const nextLines = state.lines
        .map((line) =>
          line.key === key ? { ...line, qty: line.qty + delta } : line
        )
        .filter((line) => line.qty > 0);
      return { lines: nextLines };
    }),

  setLineNote: (key, note) =>
    set((state) => {
      const targetIndex = state.lines.findIndex((line) => line.key === key);
      if (targetIndex === -1) return state;

      const target = state.lines[targetIndex];
      const trimmedNote = note.trim().slice(0, 120);
      const nextKey = buildCartLineKey(
        target.menuItemId,
        target.variants,
        trimmedNote
      );

      if (nextKey === key) {
        const nextLines = [...state.lines];
        nextLines[targetIndex] = { ...target, note: trimmedNote };
        return { lines: nextLines };
      }

      const remaining = state.lines.filter((line) => line.key !== key);
      const duplicateIndex = remaining.findIndex((line) => line.key === nextKey);

      if (duplicateIndex !== -1) {
        remaining[duplicateIndex] = {
          ...remaining[duplicateIndex],
          qty: remaining[duplicateIndex].qty + target.qty,
        };
        return { lines: remaining };
      }

      const updated = { ...target, key: nextKey, note: trimmedNote };
      remaining.splice(targetIndex, 0, updated);
      return { lines: remaining };
    }),

  removeLine: (key) =>
    set((state) => ({
      lines: state.lines.filter((line) => line.key !== key),
    })),

  clearCart: () =>
    set({
      lines: [],
      orderType: "dine_in",
      customerName: "",
      tableNo: "",
      orderNote: "",
      discountType: "percent",
      discountInput: "",
      paymentMethod: null,
      cashReceivedInput: "",
      invalidMenuIds: [],
    }),

  setOrderType: (orderType) =>
    set((state) => ({
      orderType,
      tableNo: orderType === "take_away" ? "" : state.tableNo,
    })),

  setCustomerName: (customerName) =>
    set({ customerName: customerName.slice(0, 60) }),

  setTableNo: (tableNo) => set({ tableNo: tableNo.slice(0, 10) }),

  setOrderNote: (orderNote) => set({ orderNote: orderNote.slice(0, 200) }),

  setDiscountType: (discountType) => set({ discountType }),

  setDiscountInput: (discountInput) => set({ discountInput }),

  setPaymentMethod: (paymentMethod) =>
    set((state) => ({
      paymentMethod,
      cashReceivedInput: paymentMethod === "cash" ? state.cashReceivedInput : "",
    })),

  setCashReceivedInput: (cashReceivedInput) => set({ cashReceivedInput }),

  markInvalidMenuId: (menuItemId) =>
    set((state) => ({
      invalidMenuIds: state.invalidMenuIds.includes(menuItemId)
        ? state.invalidMenuIds
        : [...state.invalidMenuIds, menuItemId],
    })),

  clearInvalidMenuIds: () => set({ invalidMenuIds: [] }),
}));
