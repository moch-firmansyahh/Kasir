import type { OrderStatus } from "@/types/db";

export const API_ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  MENU_NOT_FOUND: "MENU_NOT_FOUND",
  MENU_INACTIVE: "MENU_INACTIVE",
  VARIANT_COUNT_INVALID: "VARIANT_COUNT_INVALID",
  VARIANT_NOT_ALLOWED: "VARIANT_NOT_ALLOWED",
  DISCOUNT_EXCEEDS_SUBTOTAL: "DISCOUNT_EXCEEDS_SUBTOTAL",
  ORDER_NOT_FOUND: "ORDER_NOT_FOUND",
  INVALID_STATUS_TRANSITION: "INVALID_STATUS_TRANSITION",
  UPLOAD_FAILED: "UPLOAD_FAILED",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export function ok<T>(data: T, status = 200): Response {
  return Response.json({ data, error: null }, { status });
}

export function fail(
  code: string,
  message: string,
  status = 400,
  details?: unknown
): Response {
  return Response.json(
    { data: null, error: { code, message, details } },
    { status }
  );
}

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  baru: "dimasak",
  dimasak: "selesai",
  selesai: null,
};

/**
 * Checks whether an order status transition is allowed.
 * Setting the same status is treated as idempotent at the endpoint layer.
 */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return NEXT_STATUS[from] === to;
}
