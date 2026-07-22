import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
    select: { workspaceId: true, role: true },
  });
  const roleByWorkspace = Object.fromEntries(
    memberships.map((m: (typeof memberships)[number]) => [m.workspaceId, m.role])
  );

  return <AppShell userName={user.name} roleByWorkspace={roleByWorkspace} />;
}
