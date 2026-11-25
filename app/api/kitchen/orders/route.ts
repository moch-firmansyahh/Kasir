import { API_ERROR_CODES, fail, ok } from "@/lib/api";
import { getWibTodayStartIso } from "@/lib/format";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { KitchenOrderDTO, KitchenOrderItemDTO } from "@/types/api";
import type { OrderStatus, OrderType } from "@/types/db";

type KitchenOrderRow = {
  id: string;
  order_no: number;
  customer_name: string | null;
  order_type: OrderType;
  table_no: string | null;
  note: string | null;
  status: OrderStatus;
  created_at: string;
};

type KitchenOrderItemRow = {
  order_id: string;
  name: string;
  qty: number;
  variants: string[] | null;
  note: string | null;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") === "done" ? "done" : "active";

    const supabase = getSupabaseServerClient();

    // Explicitly select ONLY non-monetary columns (FR-KIT-05)
    const ordersQuery =
      tab === "done"
        ? supabase
            .from("orders")
            .select(
              "id, order_no, customer_name, order_type, table_no, note, status, created_at"
            )
            .eq("status", "selesai")
            .gte("created_at", getWibTodayStartIso())
            .order("created_at", { ascending: false })
        : supabase
            .from("orders")
            .select(
              "id, order_no, customer_name, order_type, table_no, note, status, created_at"
            )
            .in("status", ["baru", "dimasak"])
            .order("created_at", { ascending: true });

    const { data: ordersData, error: ordersError } = await ordersQuery;

    if (ordersError) {
      console.error("GET /api/kitchen/orders query failed:", ordersError);
      return fail(
        API_ERROR_CODES.INTERNAL_ERROR,
        "Tidak dapat memuat pesanan.",
        500
      );
    }

    const orders = (ordersData ?? []) as KitchenOrderRow[];
    if (orders.length === 0) {
      return ok<KitchenOrderDTO[]>([]);
    }

    const orderIds = orders.map((o) => o.id);
    const { data: itemsData, error: itemsError } = await supabase
      .from("order_items")
      .select("order_id, name, qty, variants, note")
      .in("order_id", orderIds);

    if (itemsError) {
      console.error("GET /api/kitchen/orders items query failed:", itemsError);
      return fail(
        API_ERROR_CODES.INTERNAL_ERROR,
        "Tidak dapat memuat pesanan.",
        500
      );
    }

    const itemsByOrder = new Map<string, KitchenOrderItemDTO[]>();
    for (const item of (itemsData ?? []) as KitchenOrderItemRow[]) {
      const list = itemsByOrder.get(item.order_id) ?? [];
      list.push({
        name: item.name,
        qty: item.qty,
        variants: item.variants ?? [],
        note: item.note,
      });
      itemsByOrder.set(item.order_id, list);
    }

    const result: KitchenOrderDTO[] = orders.map((order) => ({
      id: order.id,
      orderNo: Number(order.order_no),
      customerName: order.customer_name,
      orderType: order.order_type,
      tableNo: order.table_no,
      note: order.note,
      status: order.status,
      createdAt: order.created_at,
      items: itemsByOrder.get(order.id) ?? [],
    }));

    return ok(result);
  } catch (error) {
    console.error("GET /api/kitchen/orders unexpected error:", error);
    return fail(
      API_ERROR_CODES.INTERNAL_ERROR,
      "Tidak dapat memuat pesanan.",
      500
    );
  }
}
