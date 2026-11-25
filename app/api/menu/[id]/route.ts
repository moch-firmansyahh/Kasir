import { z } from "zod";
import { API_ERROR_CODES, fail, ok } from "@/lib/api";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { menuItemPatchInput } from "@/lib/validators";
import type { MenuItemDTO, MenuVariantDTO } from "@/types/api";
import type { MenuVariantRow } from "@/types/db";

const uuidSchema = z.string().uuid();

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!uuidSchema.safeParse(id).success) {
      return fail(
        API_ERROR_CODES.VALIDATION_ERROR,
        "ID menu tidak valid.",
        400
      );
    }

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

    const parsed = menuItemPatchInput.safeParse(rawBody);
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

    const { data: existing, error: fetchError } = await supabase
      .from("menu_items")
      .select(
        "id, category_id, name, price, image_url, is_active, variant_label, variant_pick, sort_order"
      )
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      console.error("PATCH /api/menu/[id] fetch failed:", fetchError);
      return fail(
        API_ERROR_CODES.INTERNAL_ERROR,
        "Gagal memperbarui menu.",
        500
      );
    }

    if (!existing) {
      return fail(
        API_ERROR_CODES.MENU_NOT_FOUND,
        "Menu tidak ditemukan.",
        404
      );
    }

    const { data: currentVarRows } = await supabase
      .from("menu_variants")
      .select("id, menu_item_id, name, sort_order")
      .eq("menu_item_id", id)
      .order("sort_order", { ascending: true });

    const effectivePick = input.variantPick ?? existing.variant_pick;
    const effectiveVariants =
      input.variants ??
      ((currentVarRows ?? []) as MenuVariantRow[]).map((v) => ({
        name: v.name,
        sortOrder: v.sort_order,
      }));

    if (effectivePick > 0 && effectiveVariants.length < effectivePick) {
      return fail(
        API_ERROR_CODES.VALIDATION_ERROR,
        "Jumlah varian harus minimal sama dengan jumlah wajib pilih.",
        400
      );
    }

    if (input.variants !== undefined) {
      const normalized = input.variants.map((v) => v.name.toLowerCase());
      if (new Set(normalized).size !== normalized.length) {
        return fail(
          API_ERROR_CODES.VALIDATION_ERROR,
          "Nama varian dalam satu menu tidak boleh duplikat.",
          400
        );
      }
    }

    const updates: Record<string, unknown> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.price !== undefined) updates.price = input.price;
    if (input.categoryId !== undefined) updates.category_id = input.categoryId;
    if (input.imageUrl !== undefined) updates.image_url = input.imageUrl;
    if (input.isActive !== undefined) updates.is_active = input.isActive;
    if (input.variantLabel !== undefined)
      updates.variant_label = input.variantLabel;
    if (input.variantPick !== undefined)
      updates.variant_pick = input.variantPick;
    if (input.sortOrder !== undefined) updates.sort_order = input.sortOrder;

    let updatedMenu = existing;
    if (Object.keys(updates).length > 0) {
      const { data: savedMenu, error: updateError } = await supabase
        .from("menu_items")
        .update(updates)
        .eq("id", id)
        .select(
          "id, category_id, name, price, image_url, is_active, variant_label, variant_pick, sort_order"
        )
        .single();

      if (updateError || !savedMenu) {
        console.error("PATCH /api/menu/[id] update failed:", updateError);
        return fail(
          API_ERROR_CODES.INTERNAL_ERROR,
          "Gagal memperbarui menu.",
          500
        );
      }
      updatedMenu = savedMenu;
    }

    let finalVariants: MenuVariantDTO[] = (
      (currentVarRows ?? []) as MenuVariantRow[]
    ).map((v) => ({
      id: v.id,
      name: v.name,
      sortOrder: v.sort_order,
    }));

    if (input.variants !== undefined) {
      const { error: delError } = await supabase
        .from("menu_variants")
        .delete()
        .eq("menu_item_id", id);

      if (delError) {
        console.error("PATCH /api/menu/[id] delete variants failed:", delError);
        return fail(
          API_ERROR_CODES.INTERNAL_ERROR,
          "Gagal memperbarui varian menu.",
          500
        );
      }

      if (input.variants.length > 0) {
        const rows = input.variants.map((v, idx) => ({
          menu_item_id: id,
          name: v.name,
          sort_order: v.sortOrder ?? idx,
        }));
        const { data: insertedVars, error: insError } = await supabase
          .from("menu_variants")
          .insert(rows)
          .select("id, name, sort_order")
          .order("sort_order", { ascending: true });

        if (insError) {
          console.error("PATCH /api/menu/[id] insert variants failed:", insError);
          return fail(
            API_ERROR_CODES.INTERNAL_ERROR,
            "Gagal memperbarui varian menu.",
            500
          );
        }

        finalVariants = (insertedVars ?? []).map((v) => ({
          id: v.id,
          name: v.name,
          sortOrder: v.sort_order,
        }));
      } else {
        finalVariants = [];
      }
    }

    let categoryName: string | null = null;
    if (updatedMenu.category_id) {
      const { data: cat } = await supabase
        .from("categories")
        .select("name")
        .eq("id", updatedMenu.category_id)
        .maybeSingle();
      categoryName = cat?.name ?? null;
    }

    const dto: MenuItemDTO = {
      id: updatedMenu.id,
      categoryId: updatedMenu.category_id,
      categoryName,
      name: updatedMenu.name,
      price: updatedMenu.price,
      imageUrl: updatedMenu.image_url,
      isActive: updatedMenu.is_active,
      variantLabel: updatedMenu.variant_label ?? "Varian",
      variantPick: updatedMenu.variant_pick,
      sortOrder: updatedMenu.sort_order,
      variants: finalVariants,
    };

    return ok(dto);
  } catch (error) {
    console.error("PATCH /api/menu/[id] unexpected error:", error);
    return fail(
      API_ERROR_CODES.INTERNAL_ERROR,
      "Gagal memperbarui menu.",
      500
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!uuidSchema.safeParse(id).success) {
      return fail(
        API_ERROR_CODES.VALIDATION_ERROR,
        "ID menu tidak valid.",
        400
      );
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", id)
      .select("id, image_url")
      .maybeSingle();

    if (error) {
      console.error("DELETE /api/menu/[id] failed:", error);
      return fail(
        API_ERROR_CODES.INTERNAL_ERROR,
        "Gagal menghapus menu.",
        500
      );
    }

    if (!data) {
      return fail(
        API_ERROR_CODES.MENU_NOT_FOUND,
        "Menu tidak ditemukan.",
        404
      );
    }

    if (data.image_url) {
      const bucket = process.env.SUPABASE_MENU_BUCKET || "menu-images";
      const marker = `/storage/v1/object/public/${bucket}/`;
      const idx = data.image_url.indexOf(marker);
      if (idx !== -1) {
        const storagePath = decodeURIComponent(
          data.image_url.slice(idx + marker.length)
        );
        await supabase.storage.from(bucket).remove([storagePath]);
      }
    }

    return ok({ id: data.id });
  } catch (error) {
    console.error("DELETE /api/menu/[id] unexpected error:", error);
    return fail(
      API_ERROR_CODES.INTERNAL_ERROR,
      "Gagal menghapus menu.",
      500
    );
  }
}
