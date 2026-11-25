import type { DiscountType, OrderStatus, OrderType, PaymentMethod } from "./db";

export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: ApiError };

export type CategoryDTO = {
  id: string;
  name: string;
  sortOrder: number;
};

export type MenuVariantDTO = {
  id: string;
  name: string;
  sortOrder: number;
};

export type MenuItemDTO = {
  id: string;
  categoryId: string | null;
  categoryName: string | null;
  name: string;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
  variantLabel: string;
  variantPick: number;
  sortOrder: number;
  variants: MenuVariantDTO[];
};

export type SettingsDTO = {
  storeName: string;
  taxPercent: number;
};

export type DiscountInput = {
  type: DiscountType;
  value: number;
} | null;

export type CreateOrderItemInput = {
  menuItemId: string;
  qty: number;
  variants: string[];
  note?: string;
};

export type CreateOrderInput = {
  customerName?: string;
  orderType: OrderType;
  tableNo?: string;
  note?: string;
  paymentMethod: PaymentMethod;
  discount?: DiscountInput;
  items: CreateOrderItemInput[];
};

export type CreateOrderResult = {
  id: string;
  orderNo: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: OrderStatus;
};

export type OrderItemDTO = {
  id: string;
  menuItemId: string | null;
  name: string;
  price: number;
  qty: number;
  variants: string[];
  note: string | null;
};

export type OrderDTO = {
  id: string;
  orderNo: number;
  customerName: string | null;
  orderType: OrderType;
  tableNo: string | null;
  note: string | null;
  subtotal: number;
  discountType: DiscountType | null;
  discountValue: number;
  discount: number;
  taxPercent: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentProofUrl: string | null;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  cookingAt: string | null;
  doneAt: string | null;
  items?: OrderItemDTO[];
};

export type OrderSummaryDTO = {
  count: number;
  totalSales: number;
};

export type KitchenOrderItemDTO = {
  name: string;
  qty: number;
  variants: string[];
  note: string | null;
};

/**
 * Kitchen-only order representation. Intentionally excludes all monetary and payment fields.
 */
export type KitchenOrderDTO = {
  id: string;
  orderNo: number;
  customerName: string | null;
  orderType: OrderType;
  tableNo: string | null;
  note: string | null;
  status: OrderStatus;
  createdAt: string;
  items: KitchenOrderItemDTO[];
};
