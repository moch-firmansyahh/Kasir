import { API_ERROR_CODES, fail, ok } from "@/lib/api";
import { getWibDateRangeIso, getWibDateString } from "@/lib/format";
import { calculateTotals } from "@/lib/pricing";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { createOrderInput, validateVariantSelection } from "@/lib/validators";
import type { CreateOrderResult, OrderDTO, OrderSummaryDTO } from "@/types/api";
import type { MenuItemRow, MenuVariantRow, OrderRow, OrderStatus } from "@/types/db";

const VALID_STATUSES: OrderStatus[] = ["baru", "dimasak", "selesai"];

function mapOrderRowToDto(row: OrderRow): OrderDTO {
  return {
    id: row.id,
    orderNo: Number(row.order_no),
    customerName: row.customer_name,
    orderType: row.order_type,
    tableNo: row.table_no,
    note: row.note,
    subtotal: row.subtotal,
    discountType: row.discount_type,
    discountValue: row.discount_value,
    discount: row.discount,
    taxPercent: Number(row.tax_percent),
    tax: row.tax,
    total: row.total,
    paymentMethod: row.payment_method,
    paymentProofUrl: row.payment_proof_url,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    cookingAt: row.cooking_at,
    doneAt: row.done_at,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const statusParam = searchParams.get("status");
    const limitRaw = Number.parseInt(searchParams.get("limit") ?? "50", 10);
    const offsetRaw = Number.parseInt(searchParams.get("offset") ?? "0", 10);

    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, 1), 100)
      : 50;
    const offset = Number.isFinite(offsetRaw) ? Math.max(offsetRaw, 0) : 0;

    const todayWib = getWibDateString();
    const fromYmd = dateParam || fromParam || todayWib;
    const toYmd = dateParam || toParam || fromYmd;

    const range = getWibDateRangeIso(fromYmd, toYmd);
    if (!range) {
      return fail(
        API_ERROR_CODES.VALIDATION_ERROR,
        "Rentang tanggal tidak valid.",
        400
      );
    }

    const statusFilter =
      statusParam && VALID_STATUSES.includes(statusParam as OrderStatus)
        ? (statusParam as OrderStatus)
        : null;

    const supabase = getSupabaseServerClient();

    let listQuery = supabase
      .from("orders")
      .select(
        "id, order_no, customer_name, order_type, table_no, note, subtotal, discount_type, discount_value, discount, tax_percent, tax, total, payment_method, payment_proof_url, status, created_at, updated_at, cooking_at, done_at"
      )
      .gte("created_at", range.startIso)
      .lt("created_at", range.endExclusiveIso)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit);

    let summaryQuery = supabase
      .from("orders")
      .select("total")
      .gte("created_at", range.startIso)
      .lt("created_at", range.endExclusiveIso);

    if (statusFilter) {
      listQuery = listQuery.eq("status", statusFilter);
      summaryQuery = summaryQuery.eq("status", statusFilter);
    }

    const [listRes, summaryRes] = await Promise.all([listQuery, summaryQuery]);

    if (listRes.error || summaryRes.error) {
      console.error("GET /api/orders query failed:", {
        list: listRes.error,
        summary: summaryRes.error,
      });
      return fail(
        API_ERROR_CODES.INTERNAL_ERROR,
        "Gagal memuat riwayat pesanan.",
        500
      );
    }

    const rows = (listRes.data ?? []) as OrderRow[];
    const hasMore = rows.length > limit;
    const sliced = hasMore ? rows.slice(0, limit) : rows;

    const summaryRows = (summaryRes.data ?? []) as { total: number }[];
    const summary: OrderSummaryDTO = {
      count: summaryRows.length,
      totalSales: summaryRows.reduce((sum, r) => sum + r.total, 0),
    };

    return ok({
      orders: sliced.map(mapOrderRowToDto),
      summary,
      hasMore,
    });
  } catch (error) {
    console.error("GET /api/orders unexpected error:", error);
    return fail(
      API_ERROR_CODES.INTERNAL_ERROR,
      "Gagal memuat riwayat pesanan.",
      500
    );
  }
}

export async function POST(request: Request) {
  try {
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return fail(
        API_ERROR_CODES.VALIDATION_ERROR,
        "Format data pesanan tidak valid.",
        400
      );
    }

    const parsed = createOrderInput.safeParse(rawBody);
    if (!parsed.success) {
      return fail(
        API_ERROR_CODES.VALIDATION_ERROR,
        "Data pesanan tidak lengkap atau tidak valid.",
        400,
        parsed.error.flatten()
      );
    }

    const input = parsed.data;
    const uniqueMenuIds = Array.from(
      new Set(input.items.map((item) => item.menuItemId))
    );

    const supabase = getSupabaseServerClient();

    const [menusRes, variantsRes, settingsRes] = await Promise.all([
      supabase
        .from("menu_items")
        .select("id, name, price, is_active, variant_pick")
        .in("id", uniqueMenuIds),
      supabase
        .from("menu_variants")
        .select("menu_item_id, name")
        .in("menu_item_id", uniqueMenuIds),
      supabase
        .from("settings")
        .select("tax_percent")
        .eq("id", 1)
        .maybeSingle(),
    ]);

    if (menusRes.error || variantsRes.error || settingsRes.error) {
      console.error("POST /api/orders lookup failed:", {
        menus: menusRes.error,
        variants: variantsRes.error,
        settings: settingsRes.error,
      });
      return fail(
        API_ERROR_CODES.INTERNAL_ERROR,
        "Gagal memproses pesanan. Coba lagi.",
        500
      );
    }

    const menuMap = new Map(
      ((menusRes.data ?? []) as Pick<
        MenuItemRow,
        "id" | "name" | "price" | "is_active" | "variant_pick"
      >[]).map((menu) => [menu.id, menu])
    );

    const variantsByMenu = new Map<string, string[]>();
    for (const row of (variantsRes.data ?? []) as Pick<
      MenuVariantRow,
      "menu_item_id" | "name"
    >[]) {
      const list = variantsByMenu.get(row.menu_item_id) ?? [];
      list.push(row.name);
      variantsByMenu.set(row.menu_item_id, list);
    }

    const pricedLines: { price: number; qty: number }[] = [];
    const snapshotItems: {
      menu_item_id: string;
      name: string;
      price: number;
      qty: number;
      variants: string[];
      note: string | null;
    }[] = [];

    for (const item of input.items) {
      const menu = menuMap.get(item.menuItemId);
      if (!menu) {
        return fail(
          API_ERROR_CODES.MENU_NOT_FOUND,
          "Salah satu menu tidak ditemukan. Muat ulang daftar menu.",
          404,
          { menuItemId: item.menuItemId }
        );
      }

      if (!menu.is_active) {
        return fail(
          API_ERROR_CODES.MENU_INACTIVE,
          `Menu "${menu.name}" sedang tidak aktif.`,
          409,
          { menuItemId: item.menuItemId }
        );
      }

      const allowedVariants = variantsByMenu.get(menu.id) ?? [];
      const variantCheck = validateVariantSelection(
        menu.variant_pick,
        item.variants,
        allowedVariants
      );

      if (!variantCheck.valid) {
        return fail(
          variantCheck.code,
          `${menu.name}: ${variantCheck.message}`,
          400,
          { menuItemId: item.menuItemId }
        );
      }

      pricedLines.push({ price: menu.price, qty: item.qty });
      snapshotItems.push({
        menu_item_id: menu.id,
        name: menu.name,
        price: menu.price,
        qty: item.qty,
        variants: item.variants,
        note: item.note.trim() || null,
      });
    }

    const subtotal = pricedLines.reduce((sum, l) => sum + l.price * l.qty, 0);
    const discount = input.discount ?? null;

    if (discount && discount.type === "amount" && discount.value > subtotal) {
      return fail(
        API_ERROR_CODES.DISCOUNT_EXCEEDS_SUBTOTAL,
        "Diskon nominal tidak boleh melebihi subtotal.",
        400
      );
    }

    const taxPercent =
      settingsRes.data && settingsRes.data.tax_percent != null
        ? Number(settingsRes.data.tax_percent)
        : 0;

    const totals = calculateTotals({
      lines: pricedLines,
      discount,
      taxPercent,
    });

    const pOrder = {
      customer_name: input.customerName?.trim() || null,
      order_type: input.orderType,
      table_no:
        input.orderType === "dine_in" ? input.tableNo?.trim() || null : null,
      note: input.note?.trim() || null,
      subtotal: totals.subtotal,
      discount_type: discount ? discount.type : null,
      discount_value: discount ? discount.value : 0,
      discount: totals.discount,
      tax_percent: taxPercent,
      tax: totals.tax,
      total: totals.total,
      payment_method: input.paymentMethod,
    };

    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "create_order",
      {
        p_order: pOrder,
        p_items: snapshotItems,
      }
    );

    if (rpcError || !rpcData) {
      console.error("POST /api/orders create_order RPC failed:", rpcError);
      return fail(
        API_ERROR_CODES.INTERNAL_ERROR,
        "Pesanan gagal dibuat. Coba lagi.",
        500
      );
    }

    const created = (
      Array.isArray(rpcData) ? rpcData[0] : rpcData
    ) as OrderRow | undefined;

    if (!created) {
      return fail(
        API_ERROR_CODES.INTERNAL_ERROR,
        "Pesanan gagal dibuat. Coba lagi.",
        500
      );
    }

    const result: CreateOrderResult = {
      id: created.id,
      orderNo: Number(created.order_no),
      subtotal: created.subtotal,
      discount: created.discount,
      tax: created.tax,
      total: created.total,
      status: created.status,
    };

    return ok(result, 201);
  } catch (error) {
    console.error("POST /api/orders unexpected error:", error);
    return fail(
      API_ERROR_CODES.INTERNAL_ERROR,
      "Pesanan gagal dibuat. Coba lagi.",
      500
    );
  }
}
