import { z } from "zod";
import { API_ERROR_CODES, fail, ok } from "@/lib/api";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { OrderDTO, OrderItemDTO } from "@/types/api";
import type { OrderItemRow, OrderRow } from "@/types/db";

const uuidSchema = z.string().uuid();

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!uuidSchema.safeParse(id).success) {
      return fail(
        API_ERROR_CODES.VALIDATION_ERROR,
        "ID pesanan tidak valid.",
        400
      );
    }

    const supabase = getSupabaseServerClient();

    const [orderRes, itemsRes] = await Promise.all([
      supabase
        .from("orders")
        .select(
          "id, order_no, customer_name, order_type, table_no, note, subtotal, discount_type, discount_value, discount, tax_percent, tax, total, payment_method, payment_proof_url, status, created_at, updated_at, cooking_at, done_at"
        )
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("order_items")
        .select("id, order_id, menu_item_id, name, price, qty, variants, note")
        .eq("order_id", id)
        .order("id", { ascending: true }),
    ]);

    if (orderRes.error || itemsRes.error) {
      console.error("GET /api/orders/[id] query failed:", {
        order: orderRes.error,
        items: itemsRes.error,
      });
      return fail(
        API_ERROR_CODES.INTERNAL_ERROR,
        "Gagal memuat detail pesanan.",
        500
      );
    }

    if (!orderRes.data) {
      return fail(
        API_ERROR_CODES.ORDER_NOT_FOUND,
        "Pesanan tidak ditemukan.",
        404
      );
    }

    const order = orderRes.data as OrderRow;
    const items: OrderItemDTO[] = ((itemsRes.data ?? []) as OrderItemRow[]).map(
      (item) => ({
        id: item.id,
        menuItemId: item.menu_item_id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        variants: item.variants ?? [],
        note: item.note,
      })
    );

    const dto: OrderDTO = {
      id: order.id,
      orderNo: Number(order.order_no),
      customerName: order.customer_name,
      orderType: order.order_type,
      tableNo: order.table_no,
      note: order.note,
      subtotal: order.subtotal,
      discountType: order.discount_type,
      discountValue: order.discount_value,
      discount: order.discount,
      taxPercent: Number(order.tax_percent),
      tax: order.tax,
      total: order.total,
      paymentMethod: order.payment_method,
      paymentProofUrl: order.payment_proof_url,
      status: order.status,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      cookingAt: order.cooking_at,
      doneAt: order.done_at,
      items,
    };

    return ok(dto);
  } catch (error) {
    console.error("GET /api/orders/[id] unexpected error:", error);
    return fail(
      API_ERROR_CODES.INTERNAL_ERROR,
      "Gagal memuat detail pesanan.",
      500
    );
  }
}
