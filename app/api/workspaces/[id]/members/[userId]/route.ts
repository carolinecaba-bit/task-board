import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

const VALID_ROLES = ["owner", "member"];

async function requireOwner(userId: string, workspaceId: string) {
  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  return membership?.role === "owner";
}

/**
 * Users/roles management — change a member's role within this workspace.
 * Owner-only, same as POST /members.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: workspaceId, userId: targetUserId } = await params;

  if (!(await requireOwner(user.id, workspaceId))) {
    return NextResponse.json(
      { error: "Only workspace owners can manage members" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const role = typeof body?.role === "string" ? body.role : "";
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json(
      { error: "role must be 'owner' or 'member'" },
      { status: 400 }
    );
  }

  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
  });
  if (!membership) {
    return NextResponse.json({ error: "Not a member" }, { status: 404 });
  }

  if (membership.role === "owner" && role === "member") {
    const ownerCount = await prisma.membership.count({
      where: { workspaceId, role: "owner" },
    });
    if (ownerCount <= 1) {
      return NextResponse.json(
        { error: "Workspace must keep at least one owner" },
        { status: 409 }
      );
    }
  }

  const updated = await prisma.membership.update({
    where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
    data: { role },
    include: { user: true },
  });

  return NextResponse.json({
    member: {
      id: updated.user.id,
      name: updated.user.name,
      email: updated.user.email,
      role: updated.role,
    },
  });
}

/**
 * Users/roles management — remove a member from this workspace. Owner-only.
 * Does not delete the User account itself (they may belong to other
 * workspaces) — only their Membership row for this workspace.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: workspaceId, userId: targetUserId } = await params;

  if (!(await requireOwner(user.id, workspaceId))) {
    return NextResponse.json(
      { error: "Only workspace owners can manage members" },
      { status: 403 }
    );
  }

  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
  });
  if (!membership) {
    return NextResponse.json({ error: "Not a member" }, { status: 404 });
  }

  if (membership.role === "owner") {
    const ownerCount = await prisma.membership.count({
      where: { workspaceId, role: "owner" },
    });
    if (ownerCount <= 1) {
      return NextResponse.json(
        { error: "Workspace must keep at least one owner" },
        { status: 409 }
      );
    }
  }

  await prisma.membership.delete({
    where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
  });

  return NextResponse.json({ ok: true });
}
