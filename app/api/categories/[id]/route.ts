import { z } from "zod";
import { API_ERROR_CODES, fail, ok } from "@/lib/api";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { categoryInput } from "@/lib/validators";
import type { CategoryDTO } from "@/types/api";

const uuidSchema = z.string().uuid();
const categoryPatchInput = categoryInput.partial().refine(
  (data) => data.name !== undefined || data.sortOrder !== undefined,
  { message: "Tidak ada data yang diubah." }
);

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!uuidSchema.safeParse(id).success) {
      return fail(
        API_ERROR_CODES.VALIDATION_ERROR,
        "ID kategori tidak valid.",
        400
      );
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return fail(
        API_ERROR_CODES.VALIDATION_ERROR,
        "Format data kategori tidak valid.",
        400
      );
    }

    const parsed = categoryPatchInput.safeParse(rawBody);
    if (!parsed.success) {
      return fail(
        API_ERROR_CODES.VALIDATION_ERROR,
        parsed.error.issues[0]?.message ?? "Data kategori tidak valid.",
        400,
        parsed.error.flatten()
      );
    }

    const updates: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.sortOrder !== undefined)
      updates.sort_order = parsed.data.sortOrder;

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select("id, name, sort_order")
      .maybeSingle();

    if (error) {
      console.error("PATCH /api/categories/[id] failed:", error);
      return fail(
        API_ERROR_CODES.INTERNAL_ERROR,
        "Gagal memperbarui kategori.",
        500
      );
    }

    if (!data) {
      return fail(
        API_ERROR_CODES.VALIDATION_ERROR,
        "Kategori tidak ditemukan.",
        404
      );
    }

    return ok<CategoryDTO>({
      id: data.id,
      name: data.name,
      sortOrder: data.sort_order,
    });
  } catch (error) {
    console.error("PATCH /api/categories/[id] unexpected error:", error);
    return fail(
      API_ERROR_CODES.INTERNAL_ERROR,
      "Gagal memperbarui kategori.",
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
        "ID kategori tidak valid.",
        400
      );
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("DELETE /api/categories/[id] failed:", error);
      return fail(
        API_ERROR_CODES.INTERNAL_ERROR,
        "Gagal menghapus kategori.",
        500
      );
    }

    if (!data) {
      return fail(
        API_ERROR_CODES.VALIDATION_ERROR,
        "Kategori tidak ditemukan.",
        404
      );
    }

    return ok({ id: data.id });
  } catch (error) {
    console.error("DELETE /api/categories/[id] unexpected error:", error);
    return fail(
      API_ERROR_CODES.INTERNAL_ERROR,
      "Gagal menghapus kategori.",
      500
    );
  }
}
