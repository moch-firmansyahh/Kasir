export type PosRole = "kasir" | "dapur";

export const ROLE_COOKIE_NAME = "pos_role";
export const ROLE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function isValidRole(value: unknown): value is PosRole {
  return value === "kasir" || value === "dapur";
}

export function getRoleLabel(role: PosRole): string {
  return role === "kasir" ? "Kasir" : "Dapur";
}

export function getRoleHomePath(role: PosRole): string {
  return role === "kasir" ? "/kasir" : "/dapur";
}

/**
 * Persists the selected display role in a browser cookie (not an auth mechanism).
 */
export function setClientRoleCookie(role: PosRole): void {
  if (typeof document === "undefined") return;
  document.cookie = `${ROLE_COOKIE_NAME}=${role}; Path=/; Max-Age=${ROLE_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function getClientRoleCookie(): PosRole | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${ROLE_COOKIE_NAME}=`));
  const value = match?.split("=")[1];
  return isValidRole(value) ? value : null;
}
