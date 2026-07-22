import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

const VALID_STATUSES = ["todo", "doing", "done"];

// FIXED(authn): reject unauthenticated requests with 401 before doing any work.
//
// VULN(multitenancy) / IDOR: updates a task by id with no check that the
// task's board belongs to a workspace the caller is a member of. Any caller
// who knows (or guesses/enumerates) a task id can edit it — classic IDOR.
// Students: load the task's board -> workspace, verify membership, and
// return 404/403 otherwise.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: taskId } = await params;
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
// VULN(multitenancy) / IDOR: deletes a task by id with no check that it
// belongs to a workspace the caller is a member of. Students: verify
// membership on the task's board's workspace before deleting.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: taskId } = await params;

  await prisma.task.delete({ where: { id: taskId } });

  return NextResponse.json({ ok: true });
}
