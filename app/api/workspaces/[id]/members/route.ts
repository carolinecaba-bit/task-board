import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { getMembership, isWorkspaceMember } from "@/lib/tenant";

const VALID_ROLES = ["owner", "member"];

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

  // FIXED(multitenancy): 404 if the caller isn't a member of this workspace
  // — this endpoint used to hand out any workspace's full member list.
  if (!(await isWorkspaceMember(user.id, workspaceId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const memberships = await prisma.membership.findMany({
    where: { workspaceId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  const members = memberships.map((m: (typeof memberships)[number]) => ({
    id: m.user.id,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
  }));

  return NextResponse.json({ members });
}

/**
 * Users/roles management — add a member to this workspace.
 *
 * Already owner-gated since it shipped on the auth branch (not one of the
 * original VULN(...) markers). Left as-is here, just reusing the shared
 * `getMembership` helper from lib/tenant.ts instead of an inline query.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: workspaceId } = await params;

  const requesterMembership = await getMembership(user.id, workspaceId);
  if (!requesterMembership || requesterMembership.role !== "owner") {
    return NextResponse.json(
      { error: "Only workspace owners can manage members" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const role = typeof body?.role === "string" ? body.role : "member";

  if (!email || !VALID_ROLES.includes(role)) {
    return NextResponse.json(
      { error: "A valid email and role ('owner' or 'member') are required" },
      { status: 400 }
    );
  }

  let targetUser = await prisma.user.findUnique({ where: { email } });
  let temporaryPassword: string | null = null;

  if (!targetUser) {
    if (!name) {
      return NextResponse.json(
        { error: "Name is required when inviting a brand-new user" },
        { status: 400 }
      );
    }
    temporaryPassword = crypto.randomBytes(9).toString("base64url");
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);
    targetUser = await prisma.user.create({
      data: { email, name, passwordHash },
    });
  }

  const existingMembership = await getMembership(targetUser.id, workspaceId);
  if (existingMembership) {
    return NextResponse.json(
      { error: "User is already a member of this workspace" },
      { status: 409 }
    );
  }

  const membership = await prisma.membership.create({
    data: { userId: targetUser.id, workspaceId, role },
  });

  return NextResponse.json(
    {
      member: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: membership.role,
      },
      temporaryPassword,
    },
    { status: 201 }
  );
}
