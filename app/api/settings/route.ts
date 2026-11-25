import { revalidatePath, revalidateTag } from "next/cache";
import { API_ERROR_CODES, fail, ok } from "@/lib/api";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { settingsInput } from "@/lib/validators";
import type { SettingsDTO } from "@/types/api";

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("settings")
      .select("store_name, tax_percent")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error("GET /api/settings query failed:", error);
      return fail(
        API_ERROR_CODES.INTERNAL_ERROR,
        "Gagal memuat pengaturan.",
        500
      );
    }

    const settings: SettingsDTO = {
      storeName:
        data && typeof data.store_name === "string" && data.store_name.trim()
          ? data.store_name
          : "Cemal Cemul",
      taxPercent:
        data && data.tax_percent != null ? Number(data.tax_percent) : 0,
    };

    return ok(settings);
  } catch (error) {
    console.error("GET /api/settings unexpected error:", error);
    return fail(
      API_ERROR_CODES.INTERNAL_ERROR,
      "Gagal memuat pengaturan.",
      500
    );
  }
}

export async function PUT(request: Request) {
  try {
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return fail(
        API_ERROR_CODES.VALIDATION_ERROR,
        "Format data pengaturan tidak valid.",
        400
      );
    }

    const parsed = settingsInput.safeParse(rawBody);
    if (!parsed.success) {
      return fail(
        API_ERROR_CODES.VALIDATION_ERROR,
        parsed.error.issues[0]?.message ?? "Data pengaturan tidak valid.",
        400,
        parsed.error.flatten()
      );
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("settings")
      .upsert(
        {
          id: 1,
          store_name: parsed.data.storeName,
          tax_percent: parsed.data.taxPercent,
        },
        { onConflict: "id" }
      )
      .select("store_name, tax_percent")
      .single();

    if (error || !data) {
      console.error("PUT /api/settings failed:", error);
      return fail(
        API_ERROR_CODES.INTERNAL_ERROR,
        "Gagal menyimpan pengaturan.",
        500
      );
    }

    revalidateTag("settings", { expire: 0 });
    revalidatePath("/kasir", "layout");
    revalidatePath("/dapur");

    return ok<SettingsDTO>({
      storeName: data.store_name,
      taxPercent: Number(data.tax_percent),
    });
  } catch (error) {
    console.error("PUT /api/settings unexpected error:", error);
    return fail(
      API_ERROR_CODES.INTERNAL_ERROR,
      "Gagal menyimpan pengaturan.",
      500
    );
  }
}
