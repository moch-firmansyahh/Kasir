import { z } from "zod";
import { API_ERROR_CODES, fail, ok } from "@/lib/api";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ALLOWED_IMAGE_MIME_TYPES, MAX_UPLOAD_BYTES } from "@/lib/validators";

const uuidSchema = z.string().uuid();

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function extractStoragePathFromPublicUrl(
  url: string,
  bucket: string
): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

export async function POST(
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

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return fail(
        API_ERROR_CODES.VALIDATION_ERROR,
        "File foto bukti bayar wajib disertakan.",
        400
      );
    }

    if (
      !ALLOWED_IMAGE_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number]
      )
    ) {
      return fail(
        API_ERROR_CODES.VALIDATION_ERROR,
        "Format foto harus JPG, PNG, atau WebP.",
        400
      );
    }

    if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
      return fail(
        API_ERROR_CODES.FILE_TOO_LARGE,
        "Ukuran foto maksimal 2 MB.",
        413
      );
    }

    const supabase = getSupabaseServerClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, payment_proof_url")
      .eq("id", id)
      .maybeSingle();

    if (orderError) {
      console.error("POST /api/orders/[id]/proof lookup failed:", orderError);
      return fail(
        API_ERROR_CODES.INTERNAL_ERROR,
        "Gagal memverifikasi pesanan.",
        500
      );
    }

    if (!order) {
      return fail(
        API_ERROR_CODES.ORDER_NOT_FOUND,
        "Pesanan tidak ditemukan.",
        404
      );
    }

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "payment-proofs";
    const ext = MIME_TO_EXT[file.type] ?? "jpg";
    const filePath = `${id}/${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("POST /api/orders/[id]/proof upload failed:", uploadError);
      return fail(
        API_ERROR_CODES.UPLOAD_FAILED,
        "Foto gagal diunggah.",
        502
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    const publicUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
      .from("orders")
      .update({ payment_proof_url: publicUrl })
      .eq("id", id);

    if (updateError) {
      console.error("POST /api/orders/[id]/proof DB update failed:", updateError);
      await supabase.storage.from(bucket).remove([filePath]);
      return fail(
        API_ERROR_CODES.UPLOAD_FAILED,
        "Foto gagal disimpan ke pesanan.",
        502
      );
    }

    if (order.payment_proof_url) {
      const oldPath = extractStoragePathFromPublicUrl(
        order.payment_proof_url,
        bucket
      );
      if (oldPath && oldPath !== filePath) {
        await supabase.storage.from(bucket).remove([oldPath]);
      }
    }

    return ok({ paymentProofUrl: publicUrl });
  } catch (error) {
    console.error("POST /api/orders/[id]/proof unexpected error:", error);
    return fail(
      API_ERROR_CODES.UPLOAD_FAILED,
      "Foto gagal diunggah.",
      502
    );
  }
}
