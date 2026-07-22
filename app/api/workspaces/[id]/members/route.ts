import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

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

  // VULN(multitenancy): fetches memberships by workspaceId directly with no
  // check that the caller belongs to this workspace. Used by the UI to
  // populate the assignee dropdown, but it just as happily leaks the full
  // member list of a workspace the caller isn't in. Students: verify
  // membership before querying. (Left for the Part 2 PR, along with the
  // other read-path VULN(multitenancy) markers.)
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
 * This is a brand-new endpoint (not one of the original VULN(...) markers),
 * so unlike the GET above it ships here with its authorization check
 * already in place: only an existing "owner" of this workspace may call it.
 * If the email doesn't match an existing user, a new account is created
 * with a randomly generated temporary password (returned once in the
 * response — there's no email/SMTP in this exercise to deliver it any
 * other way).
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

  const requesterMembership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: user.id, workspaceId } },
  });
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

  const existingMembership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: targetUser.id, workspaceId } },
  });
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
