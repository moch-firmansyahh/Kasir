import { API_ERROR_CODES, fail, ok } from "@/lib/api";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { menuItemInput } from "@/lib/validators";
import type { CategoryDTO, MenuItemDTO, MenuVariantDTO } from "@/types/api";
import type { CategoryRow, MenuItemRow, MenuVariantRow } from "@/types/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const supabase = getSupabaseServerClient();

    const [categoriesRes, itemsRes, variantsRes] = await Promise.all([
      supabase
        .from("categories")
        .select("id, name, sort_order, created_at")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      includeInactive
        ? supabase
            .from("menu_items")
            .select(
              "id, category_id, name, price, image_url, is_active, variant_label, variant_pick, sort_order, created_at, updated_at"
            )
            .order("sort_order", { ascending: true })
            .order("name", { ascending: true })
        : supabase
            .from("menu_items")
            .select(
              "id, category_id, name, price, image_url, is_active, variant_label, variant_pick, sort_order, created_at, updated_at"
            )
            .eq("is_active", true)
            .order("sort_order", { ascending: true })
            .order("name", { ascending: true }),
      supabase
        .from("menu_variants")
        .select("id, menu_item_id, name, sort_order")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
    ]);

    if (categoriesRes.error || itemsRes.error || variantsRes.error) {
      console.error("GET /api/menu query failed:", {
        categories: categoriesRes.error,
        items: itemsRes.error,
        variants: variantsRes.error,
      });
      return fail(
        API_ERROR_CODES.INTERNAL_ERROR,
        "Gagal memuat daftar menu.",
        500
      );
    }

    const categories: CategoryDTO[] = (
      (categoriesRes.data ?? []) as CategoryRow[]
    ).map((cat) => ({
      id: cat.id,
      name: cat.name,
      sortOrder: cat.sort_order,
    }));

    const categoryMap = new Map(categories.map((cat) => [cat.id, cat.name]));

    const variantsByItem = new Map<string, MenuVariantDTO[]>();
    for (const row of (variantsRes.data ?? []) as MenuVariantRow[]) {
      const list = variantsByItem.get(row.menu_item_id) ?? [];
      list.push({
        id: row.id,
        name: row.name,
        sortOrder: row.sort_order,
      });
      variantsByItem.set(row.menu_item_id, list);
    }

    const items: MenuItemDTO[] = ((itemsRes.data ?? []) as MenuItemRow[]).map(
      (item) => ({
        id: item.id,
        categoryId: item.category_id,
        categoryName: item.category_id
          ? (categoryMap.get(item.category_id) ?? null)
          : null,
        name: item.name,
        price: item.price,
        imageUrl: item.image_url,
        isActive: item.is_active,
        variantLabel: item.variant_label ?? "Varian",
        variantPick: item.variant_pick,
        sortOrder: item.sort_order,
        variants: variantsByItem.get(item.id) ?? [],
      })
    );

    return ok({ categories, items });
  } catch (error) {
    console.error("GET /api/menu unexpected error:", error);
    return fail(
      API_ERROR_CODES.INTERNAL_ERROR,
      "Gagal memuat daftar menu.",
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
        "Format data menu tidak valid.",
        400
      );
    }

    const parsed = menuItemInput.safeParse(rawBody);
    if (!parsed.success) {
      return fail(
        API_ERROR_CODES.VALIDATION_ERROR,
        parsed.error.issues[0]?.message ?? "Data menu tidak valid.",
        400,
        parsed.error.flatten()
      );
    }

    const input = parsed.data;
    const supabase = getSupabaseServerClient();

    const { data: createdMenu, error: insertError } = await supabase
      .from("menu_items")
      .insert({
        name: input.name,
        price: input.price,
        category_id: input.categoryId,
        image_url: input.imageUrl,
        is_active: input.isActive,
        variant_label: input.variantLabel,
        variant_pick: input.variantPick,
        sort_order: input.sortOrder,
      })
      .select(
        "id, category_id, name, price, image_url, is_active, variant_label, variant_pick, sort_order"
      )
      .single();

    if (insertError || !createdMenu) {
      console.error("POST /api/menu insert failed:", insertError);
      return fail(
        API_ERROR_CODES.INTERNAL_ERROR,
        "Gagal menyimpan menu.",
        500
      );
    }

    let createdVariants: MenuVariantDTO[] = [];
    if (input.variants.length > 0) {
      const variantRows = input.variants.map((v, idx) => ({
        menu_item_id: createdMenu.id,
        name: v.name,
        sort_order: v.sortOrder ?? idx,
      }));

      const { data: insertedVars, error: varError } = await supabase
        .from("menu_variants")
        .insert(variantRows)
        .select("id, name, sort_order")
        .order("sort_order", { ascending: true });

      if (varError) {
        console.error("POST /api/menu variants insert failed:", varError);
        await supabase.from("menu_items").delete().eq("id", createdMenu.id);
        return fail(
          API_ERROR_CODES.INTERNAL_ERROR,
          "Gagal menyimpan varian menu.",
          500
        );
      }

      createdVariants = (insertedVars ?? []).map((v) => ({
        id: v.id,
        name: v.name,
        sortOrder: v.sort_order,
      }));
    }

    let categoryName: string | null = null;
    if (createdMenu.category_id) {
      const { data: cat } = await supabase
        .from("categories")
        .select("name")
        .eq("id", createdMenu.category_id)
        .maybeSingle();
      categoryName = cat?.name ?? null;
    }

    const dto: MenuItemDTO = {
      id: createdMenu.id,
      categoryId: createdMenu.category_id,
      categoryName,
      name: createdMenu.name,
      price: createdMenu.price,
      imageUrl: createdMenu.image_url,
      isActive: createdMenu.is_active,
      variantLabel: createdMenu.variant_label ?? "Varian",
      variantPick: createdMenu.variant_pick,
      sortOrder: createdMenu.sort_order,
      variants: createdVariants,
    };

    return ok(dto, 201);
  } catch (error) {
    console.error("POST /api/menu unexpected error:", error);
    return fail(
      API_ERROR_CODES.INTERNAL_ERROR,
      "Gagal menyimpan menu.",
      500
    );
  }
}
