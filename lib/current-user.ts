import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, verifySession } from "@/lib/jwt";

/**
 * ============================================================================
 *  AUTH SEAM — real session/token lookup lives here now.
 * ============================================================================
 *
 * `getCurrentUser()` reads the `session` cookie set by `POST /api/auth/login`,
 * verifies it as a JWT (see `lib/jwt.ts`), and loads the corresponding user
 * from the database.
 *
 * IMPORTANT: this function returns `null` for anonymous/invalid/expired
 * sessions — it does NOT throw and does NOT fall back to a hardcoded user.
 * Every route handler under `app/api/**` MUST check for `null` and return
 * `401 Unauthorized` itself before touching the database; this function has
 * no access to the Response object, so it can't do that on the caller's
 * behalf.
 * ============================================================================
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = verifySession(token);
  if (!session) return null;

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  return user;
}
