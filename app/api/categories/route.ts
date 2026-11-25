import { API_ERROR_CODES, fail, ok } from "@/lib/api";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { categoryInput } from "@/lib/validators";
import type { CategoryDTO } from "@/types/api";
import type { CategoryRow } from "@/types/db";

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, sort_order, created_at")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("GET /api/categories failed:", error);
      return fail(
        API_ERROR_CODES.INTERNAL_ERROR,
        "Gagal memuat kategori.",
        500
      );
    }

    const categories: CategoryDTO[] = ((data ?? []) as CategoryRow[]).map(
      (cat) => ({
        id: cat.id,
        name: cat.name,
        sortOrder: cat.sort_order,
      })
    );

    return ok(categories);
  } catch (error) {
    console.error("GET /api/categories unexpected error:", error);
    return fail(API_ERROR_CODES.INTERNAL_ERROR, "Gagal memuat kategori.", 500);
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
        "Format data kategori tidak valid.",
        400
      );
    }

    const parsed = categoryInput.safeParse(rawBody);
    if (!parsed.success) {
      return fail(
        API_ERROR_CODES.VALIDATION_ERROR,
        parsed.error.issues[0]?.message ?? "Data kategori tidak valid.",
        400,
        parsed.error.flatten()
      );
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: parsed.data.name,
        sort_order: parsed.data.sortOrder,
      })
      .select("id, name, sort_order")
      .single();

    if (error || !data) {
      console.error("POST /api/categories failed:", error);
      return fail(
        API_ERROR_CODES.INTERNAL_ERROR,
        "Gagal menyimpan kategori.",
        500
      );
    }

    return ok<CategoryDTO>(
      {
        id: data.id,
        name: data.name,
        sortOrder: data.sort_order,
      },
      201
    );
  } catch (error) {
    console.error("POST /api/categories unexpected error:", error);
    return fail(
      API_ERROR_CODES.INTERNAL_ERROR,
      "Gagal menyimpan kategori.",
      500
    );
  }
}
