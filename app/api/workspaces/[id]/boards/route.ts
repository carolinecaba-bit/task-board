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

  // VULN(multitenancy): fetches boards by workspaceId directly with no
  // membership check — any caller can list any workspace's boards, even one
  // they've never belonged to. Students: verify getCurrentUser() has a
  // Membership row for this workspaceId before querying, and return
  // 404/403 otherwise.
  const boards = await prisma.board.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ boards });
}
