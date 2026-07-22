import { prisma } from "@/lib/prisma";

/**
 * ============================================================================
 *  AUTH SEAM — THIS IS THE ONE PLACE REAL AUTHENTICATION PLUGS IN.
 * ============================================================================
 *
 * There is no login screen, no session, and no password anywhere in this
 * codebase. `getCurrentUser()` is a hardcoded stub: it always returns the
 * same user (Ana, from the "Acme" workspace) regardless of who is actually
 * making the request — there IS no "actually making the request", because
 * nothing here reads cookies, headers, or a session store.
 *
 * Every route handler in `app/api/**` calls this function and trusts its
 * result unconditionally. That is `// VULN(authn)` at every call site: an
 * unauthenticated caller gets treated exactly like Ana, every time.
 *
 * Students: replace this function's internals with real session/token
 * lookup (NextAuth/Auth.js, Lucia, iron-session, your own JWT — your
 * choice). Concretely:
 *
 *   1. Read the session (cookie, header, whatever your auth library uses)
 *      from the incoming request.
 *   2. If there is no valid session, the CALLER (the route handler) must
 *      return 401 before doing any work — this function alone can't do
 *      that because it doesn't have access to the Response object.
 *   3. If there is a valid session, look up and return the real user it
 *      belongs to, instead of the hardcoded Ana record below.
 *
 * Do not just make this function "smarter" — the point is for every route
 * that calls it to also add an explicit unauthenticated check. Search the
 * codebase for `// VULN(authn)` to find every place that needs one.
 * ============================================================================
 */
export async function getCurrentUser() {
  const user = await prisma.user.findUnique({
    where: { email: "ana@acme.test" },
  });

  if (!user) {
    throw new Error(
      "Dev stub user not found — did you run `npm run seed`? getCurrentUser() expects ana@acme.test to exist."
    );
  }

  return user;
}
