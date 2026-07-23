import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { isWorkspaceMember } from "@/lib/tenant";

// FIXED(authn): reject unauthenticated requests with 401 before doing any work.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: workspaceId } = await params;

  // FIXED(multitenancy): 404 (not 403) if the caller isn't a member of this
  // workspace, so the response doesn't confirm the workspace exists to
  // someone who has no business knowing that.
  if (!(await isWorkspaceMember(user.id, workspaceId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const boards = await prisma.board.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ boards });
}
