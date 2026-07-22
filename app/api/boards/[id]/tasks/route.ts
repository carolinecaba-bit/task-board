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
  const { id: boardId } = await params;

  // VULN(multitenancy): fetches tasks by boardId directly with no check that
  // the board belongs to a workspace the caller is a member of. Students:
  // look up the board's workspaceId, verify getCurrentUser() is a member of
  // it, and return 404/403 otherwise.
  const tasks = await prisma.task.findMany({
    where: { boardId },
    include: { assignee: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ tasks });
}

// VULN(authn): route trusts getCurrentUser() unconditionally and never returns 401.
// Students: reject unauthenticated requests with 401 before doing any work.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await getCurrentUser();
  const { id: boardId } = await params;
  const body = await request.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // VULN(multitenancy): creates a task on any boardId with no check that the
  // board belongs to a workspace the caller is a member of. Students: verify
  // membership on the board's workspace before writing.
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
