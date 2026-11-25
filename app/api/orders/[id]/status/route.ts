import { z } from "zod";
import { API_ERROR_CODES, canTransition, fail, ok } from "@/lib/api";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { updateOrderStatusInput } from "@/lib/validators";
import type { OrderStatus } from "@/types/db";

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
        "ID pesanan tidak valid.",
        400
      );
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return fail(
        API_ERROR_CODES.VALIDATION_ERROR,
        "Format permintaan tidak valid.",
        400
      );
    }

    const parsed = updateOrderStatusInput.safeParse(rawBody);
    if (!parsed.success) {
      return fail(
        API_ERROR_CODES.VALIDATION_ERROR,
        "Status pesanan tidak valid.",
        400,
        parsed.error.flatten()
      );
    }

    const nextStatus = parsed.data.status;
    const supabase = getSupabaseServerClient();

    const { data: existing, error: fetchError } = await supabase
      .from("orders")
      .select("id, status")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      console.error("PATCH /api/orders/[id]/status fetch failed:", fetchError);
      return fail(
        API_ERROR_CODES.INTERNAL_ERROR,
        "Gagal memperbarui status pesanan.",
        500
      );
    }

    if (!existing) {
      return fail(
        API_ERROR_CODES.ORDER_NOT_FOUND,
        "Pesanan tidak ditemukan.",
        404
      );
    }

    const currentStatus = existing.status as OrderStatus;
    if (currentStatus === nextStatus) {
      return ok({ id: existing.id, status: currentStatus });
    }

    if (!canTransition(currentStatus, nextStatus)) {
      return fail(
        API_ERROR_CODES.INVALID_STATUS_TRANSITION,
        "Perubahan status tidak diizinkan.",
        409
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from("orders")
      .update({ status: nextStatus })
      .eq("id", id)
      .select("id, status")
      .single();

    if (updateError || !updated) {
      console.error("PATCH /api/orders/[id]/status update failed:", updateError);
      return fail(
        API_ERROR_CODES.INTERNAL_ERROR,
        "Gagal memperbarui status pesanan.",
        500
      );
    }

    return ok({ id: updated.id, status: updated.status as OrderStatus });
  } catch (error) {
    console.error("PATCH /api/orders/[id]/status unexpected error:", error);
    return fail(
      API_ERROR_CODES.INTERNAL_ERROR,
      "Gagal memperbarui status pesanan.",
      500
    );
  }
}
