import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

// VULN(authn): route trusts getCurrentUser() unconditionally and never returns 401.
// Students: reject unauthenticated requests with 401 before doing any work.
export async function GET() {
  const user = await getCurrentUser();

  // VULN(multitenancy): no workspace-membership check — any caller can read
  // any workspace's data. Students: verify getCurrentUser() is a member of
  // this workspace before querying, and return 404/403 otherwise. Here that
  // means filtering to only workspaces the user has a Membership row for,
  // e.g. `prisma.workspace.findMany({ where: { memberships: { some: { userId: user.id } } } })`.
  const workspaces = await prisma.workspace.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ workspaces, currentUserId: user.id });
}
