import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

// VULN(authn): route trusts getCurrentUser() unconditionally and never returns 401.
// Students: reject unauthenticated requests with 401 before doing any work.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await getCurrentUser();
  const { id: workspaceId } = await params;

  // VULN(multitenancy): fetches memberships by workspaceId directly with no
  // check that the caller belongs to this workspace. Used by the UI to
  // populate the assignee dropdown, but it just as happily leaks the full
  // member list of a workspace the caller isn't in. Students: verify
  // membership before querying.
  const memberships = await prisma.membership.findMany({
    where: { workspaceId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  const members = memberships.map((m) => ({
    id: m.user.id,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
  }));

  return NextResponse.json({ members });
}
