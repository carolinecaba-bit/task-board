import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

// FIXED(authn): reject unauthenticated requests with 401 before doing any work.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // FIXED(multitenancy): only return workspaces the current user has a
  // Membership row for, instead of every workspace in the database.
  const workspaces = await prisma.workspace.findMany({
    where: { memberships: { some: { userId: user.id } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ workspaces, currentUserId: user.id });
}
