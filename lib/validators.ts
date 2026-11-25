import { z } from "zod";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB

export const orderItemInput = z.object({
  menuItemId: z.string().uuid(),
  qty: z.number().int().min(1).max(99),
  variants: z.array(z.string().trim().min(1)).default([]),
  note: z.string().trim().max(120).optional().default(""),
});

export const discountSchema = z
  .object({
    type: z.enum(["percent", "amount"]),
    value: z.number().int().min(0),
  })
  .refine(
    (d) => (d.type === "percent" ? d.value <= 100 : true),
    { message: "Diskon persen maksimal 100%" }
  );

export const createOrderInput = z.object({
  customerName: z.string().trim().max(60).optional(),
  orderType: z.enum(["dine_in", "take_away"]),
  tableNo: z.string().trim().max(10).optional(),
  note: z.string().trim().max(200).optional(),
  paymentMethod: z.enum(["cash", "qris", "transfer"]),
  discount: discountSchema.nullable().optional(),
  items: z.array(orderItemInput).min(1).max(50),
});

export const updateOrderStatusInput = z.object({
  status: z.enum(["baru", "dimasak", "selesai"]),
});

export const categoryInput = z.object({
  name: z.string().trim().min(1, "Nama kategori wajib diisi").max(50),
  sortOrder: z.number().int().min(0).optional().default(0),
});

const imageUrlSchema = z
  .string()
  .trim()
  .refine(
    (val) => {
      if (val.startsWith("/")) return !val.startsWith("//");
      try {
        const u = new URL(val);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "URL gambar tidak valid" }
  );

export const menuItemInput = z
  .object({
    name: z.string().trim().min(1, "Nama menu wajib diisi").max(80),
    price: z.number().int().min(0, "Harga tidak boleh negatif"),
    categoryId: z.string().uuid().nullable().optional().default(null),
    imageUrl: imageUrlSchema.nullable().optional().default(null),
    isActive: z.boolean().optional().default(true),
    variantLabel: z.string().trim().min(1).max(40).optional().default("Varian"),
    variantPick: z.number().int().min(0).optional().default(0),
    sortOrder: z.number().int().min(0).optional().default(0),
    variants: z
      .array(
        z.object({
          name: z.string().trim().min(1, "Nama varian wajib diisi").max(50),
          sortOrder: z.number().int().min(0).optional().default(0),
        })
      )
      .optional()
      .default([]),
  })
  .refine(
    (m) => m.variantPick === 0 || m.variants.length >= m.variantPick,
    {
      message: "Jumlah varian harus minimal sama dengan jumlah wajib pilih",
      path: ["variants"],
    }
  )
  .refine(
    (m) => {
      const normalized = m.variants.map((v) => v.name.toLowerCase());
      return new Set(normalized).size === normalized.length;
    },
    {
      message: "Nama varian dalam satu menu tidak boleh duplikat",
      path: ["variants"],
    }
  );

export const menuItemPatchInput = z.object({
  name: z.string().trim().min(1, "Nama menu wajib diisi").max(80).optional(),
  price: z.number().int().min(0, "Harga tidak boleh negatif").optional(),
  categoryId: z.string().uuid().nullable().optional(),
  imageUrl: imageUrlSchema.nullable().optional(),
  isActive: z.boolean().optional(),
  variantLabel: z.string().trim().min(1).max(40).optional(),
  variantPick: z.number().int().min(0).optional(),
  sortOrder: z.number().int().min(0).optional(),
  variants: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Nama varian wajib diisi").max(50),
        sortOrder: z.number().int().min(0).optional().default(0),
      })
    )
    .optional(),
});

export const settingsInput = z.object({
  storeName: z.string().trim().min(1, "Nama toko wajib diisi").max(60),
  taxPercent: z
    .number()
    .min(0, "Pajak minimal 0%")
    .max(100, "Pajak maksimal 100%")
    .refine(
      (n) => Math.round(n * 100) === n * 100,
      { message: "Pajak maksimal 2 angka di belakang koma" }
    ),
});

export type VariantValidationResult =
  | { valid: true }
  | {
      valid: false;
      code: "VARIANT_COUNT_INVALID" | "VARIANT_NOT_ALLOWED";
      message: string;
    };

/**
 * Validates selected variants against menu rules.
 * Repeated variants (e.g. Couple Cemul: Mangga + Mangga) are permitted per assumption A9.
 */
export function validateVariantSelection(
  variantPick: number,
  selectedVariants: string[],
  allowedVariants: string[]
): VariantValidationResult {
  if (variantPick === 0) {
    if (selectedVariants.length > 0) {
      return {
        valid: false,
        code: "VARIANT_COUNT_INVALID",
        message: "Menu ini tidak memiliki varian",
      };
    }
    return { valid: true };
  }

  if (selectedVariants.length !== variantPick) {
    return {
      valid: false,
      code: "VARIANT_COUNT_INVALID",
      message: `Pilih tepat ${variantPick} varian`,
    };
  }

  const allowedSet = new Set(allowedVariants);
  for (const variant of selectedVariants) {
    if (!allowedSet.has(variant)) {
      return {
        valid: false,
        code: "VARIANT_NOT_ALLOWED",
        message: `Varian "${variant}" tidak tersedia pada menu ini`,
      };
    }
  }

  return { valid: true };
}
