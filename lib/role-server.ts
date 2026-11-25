import "server-only";
import { cookies } from "next/headers";
import { isValidRole, ROLE_COOKIE_NAME, type PosRole } from "./role";

/**
 * Reads the current display role from request cookies on the server.
 */
export async function getServerRole(): Promise<PosRole | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(ROLE_COOKIE_NAME)?.value;
  return isValidRole(value) ? value : null;
}
