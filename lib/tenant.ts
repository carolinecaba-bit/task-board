import { prisma } from "@/lib/prisma";

/**
 * Multitenancy helpers.
 *
 * `Workspace` is the tenant boundary in this app: every `Board` has a
 * `workspaceId`, every `Task` belongs to a `Board`, and a `Membership` row
 * is the only thing that says "this user may see this workspace's data".
 *
 * These helpers centralize the two things every VULN(multitenancy) call
 * site needs: (1) resolve a Board/Task id up to its workspaceId, and
 * (2) check whether the current user has a Membership there. Callers
 * decide the HTTP response (404 to avoid confirming a resource exists to
 * someone who isn't a member of its workspace — see EXERCISE.md).
 */

export async function getMembership(userId: string, workspaceId: string) {
  return prisma.membership.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
}

export async function isWorkspaceMember(userId: string, workspaceId: string) {
  return (await getMembership(userId, workspaceId)) !== null;
}

export async function getBoardWorkspaceId(
  boardId: string
): Promise<string | null> {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { workspaceId: true },
  });
  return board?.workspaceId ?? null;
}

/** Walks task -> board -> workspaceId. This is the IDOR-prone lookup: a
 * task id alone doesn't carry its workspace, so every task route must do
 * this before trusting the id. */
export async function getTaskWorkspaceId(
  taskId: string
): Promise<string | null> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { board: { select: { workspaceId: true } } },
  });
  return task?.board.workspaceId ?? null;
}
