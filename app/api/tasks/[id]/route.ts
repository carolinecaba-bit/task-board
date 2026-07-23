import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { getTaskWorkspaceId, isWorkspaceMember } from "@/lib/tenant";

const VALID_STATUSES = ["todo", "doing", "done"];

// FIXED(authn): reject unauthenticated requests with 401 before doing any work.
//
// FIXED(multitenancy) / IDOR: a task id alone doesn't tell you its
// workspace, so we walk task -> board -> workspaceId (getTaskWorkspaceId)
// and confirm membership before allowing the update. A caller who
// guesses/enumerates a task id from another workspace now gets 404
// instead of silently editing it.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: taskId } = await params;

  const workspaceId = await getTaskWorkspaceId(taskId);
  if (!workspaceId || !(await isWorkspaceMember(user.id, workspaceId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();

  const data: { title?: string; status?: string; assigneeId?: string | null } =
    {};

  if (typeof body.title === "string" && body.title.trim()) {
    data.title = body.title.trim();
  }
  if (typeof body.status === "string" && VALID_STATUSES.includes(body.status)) {
    data.status = body.status;
  }
  if (body.assigneeId === null || typeof body.assigneeId === "string") {
    data.assigneeId = body.assigneeId;
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data,
    include: { assignee: true },
  });

  return NextResponse.json({ task });
}

// FIXED(authn): reject unauthenticated requests with 401 before doing any work.
//
// FIXED(multitenancy) / IDOR: same task -> board -> workspace membership
// check before deleting.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: taskId } = await params;

  const workspaceId = await getTaskWorkspaceId(taskId);
  if (!workspaceId || !(await isWorkspaceMember(user.id, workspaceId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id: taskId } });

  return NextResponse.json({ ok: true });
}
