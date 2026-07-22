import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

// VULN(authn): route trusts getCurrentUser() unconditionally and never returns 401.
// Students: reject unauthenticated requests with 401 before doing any work.
//
// VULN(multitenancy): deletes a board by id with no check that it belongs to
// a workspace the caller is a member of. Students: verify membership on the
// board's workspace before deleting.
//
// VULN(authz): no role check — deleting a board should be owner-only, but
// any member (or, combined with the bugs above, any caller at all) can do
// it. Students: return 403 unless getCurrentUser() has role "owner" on this
// board's workspace.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await getCurrentUser();
  const { id: boardId } = await params;

  await prisma.board.delete({ where: { id: boardId } });

  return NextResponse.json({ ok: true });
}
