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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const menuIdRaw = formData.get("menuId");

    if (!(file instanceof File)) {
      return fail(
        API_ERROR_CODES.VALIDATION_ERROR,
        "File gambar wajib dipilih.",
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
        "Format gambar harus JPG, PNG, atau WebP.",
        400
      );
    }

    if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
      return fail(
        API_ERROR_CODES.FILE_TOO_LARGE,
        "Ukuran gambar maksimal 2 MB.",
        413
      );
    }

    const folder =
      typeof menuIdRaw === "string" && uuidSchema.safeParse(menuIdRaw).success
        ? menuIdRaw
        : "draft";

    const bucket = process.env.SUPABASE_MENU_BUCKET || "menu-images";
    const ext = MIME_TO_EXT[file.type] ?? "jpg";
    const filePath = `${folder}/${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const supabase = getSupabaseServerClient();
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("POST /api/upload/menu-image failed:", uploadError);
      return fail(
        API_ERROR_CODES.UPLOAD_FAILED,
        "Gambar menu gagal diunggah.",
        502
      );
    }

    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return ok({ imageUrl: publicData.publicUrl });
  } catch (error) {
    console.error("POST /api/upload/menu-image unexpected error:", error);
    return fail(
      API_ERROR_CODES.UPLOAD_FAILED,
      "Gambar menu gagal diunggah.",
      502
    );
  }
}
