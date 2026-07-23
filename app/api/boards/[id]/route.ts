import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { getBoardWorkspaceId, getMembership } from "@/lib/tenant";

// FIXED(authn): reject unauthenticated requests with 401 before doing any work.
//
// FIXED(multitenancy): resolve the board's workspace and require a
// Membership row before allowing anything — 404 if the caller isn't a
// member (don't confirm the board exists).
//
// FIXED(authz): deleting a board is owner-only. Once we know the caller is
// a member, also check their role on that membership — 403 if it isn't
// "owner". This reuses the same lookup as the multitenancy fix above,
// which is why it was left for this PR instead of the auth PR.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: boardId } = await params;

  const workspaceId = await getBoardWorkspaceId(boardId);
  if (!workspaceId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const membership = await getMembership(user.id, workspaceId);
  if (!membership) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (membership.role !== "owner") {
    return NextResponse.json(
      { error: "Only workspace owners can delete boards" },
      { status: 403 }
    );
  }

  await prisma.board.delete({ where: { id: boardId } });

  return NextResponse.json({ ok: true });
}
