import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { getBoardWorkspaceId, isWorkspaceMember } from "@/lib/tenant";

// FIXED(authn): reject unauthenticated requests with 401 before doing any work.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: boardId } = await params;

  // FIXED(multitenancy): resolve the board's workspace and confirm the
  // caller is a member before listing its tasks. 404 either way (unknown
  // board vs. board in a workspace the caller isn't in look identical).
  const workspaceId = await getBoardWorkspaceId(boardId);
  if (!workspaceId || !(await isWorkspaceMember(user.id, workspaceId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const tasks = await prisma.task.findMany({
    where: { boardId },
    include: { assignee: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ tasks });
}

// FIXED(authn): reject unauthenticated requests with 401 before doing any work.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: boardId } = await params;

  // FIXED(multitenancy): same board -> workspace -> membership check before
  // allowing a write, not just reads.
  const workspaceId = await getBoardWorkspaceId(boardId);
  if (!workspaceId || !(await isWorkspaceMember(user.id, workspaceId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      title,
      boardId,
      status: "todo",
    },
    include: { assignee: true },
  });

  return NextResponse.json({ task }, { status: 201 });
}
