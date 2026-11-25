export type OrderType = "dine_in" | "take_away";
export type PaymentMethod = "cash" | "qris" | "transfer";
export type DiscountType = "percent" | "amount";
export type OrderStatus = "baru" | "dimasak" | "selesai";

export type CategoryRow = {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
};

export type MenuItemRow = {
  id: string;
  category_id: string | null;
  name: string;
  price: number;
  image_url: string | null;
  is_active: boolean;
  variant_label: string | null;
  variant_pick: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type MenuVariantRow = {
  id: string;
  menu_item_id: string;
  name: string;
  sort_order: number;
};

export type SettingsRow = {
  id: number;
  store_name: string;
  tax_percent: number;
  updated_at: string;
};

export type OrderRow = {
  id: string;
  order_no: number;
  customer_name: string | null;
  order_type: OrderType;
  table_no: string | null;
  note: string | null;
  subtotal: number;
  discount_type: DiscountType | null;
  discount_value: number;
  discount: number;
  tax_percent: number;
  tax: number;
  total: number;
  payment_method: PaymentMethod;
  payment_proof_url: string | null;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  cooking_at: string | null;
  done_at: string | null;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  name: string;
  price: number;
  qty: number;
  variants: string[];
  note: string | null;
};
