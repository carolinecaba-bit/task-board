import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (SQLite dev database, safe to wipe on reseed).
  await prisma.task.deleteMany();
  await prisma.board.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  const ana = await prisma.user.create({
    data: { email: "ana@acme.test", name: "Ana" },
  });
  const beto = await prisma.user.create({
    data: { email: "beto@acme.test", name: "Beto" },
  });
  const carla = await prisma.user.create({
    data: { email: "carla@globex.test", name: "Carla" },
  });

  const acme = await prisma.workspace.create({ data: { name: "Acme" } });
  const globex = await prisma.workspace.create({ data: { name: "Globex" } });

  // Nobody belongs to both workspaces — any UI/API that shows both
  // workspaces' data to a single user is proof the tenant filter is missing.
  await prisma.membership.create({
    data: { userId: ana.id, workspaceId: acme.id, role: "owner" },
  });
  await prisma.membership.create({
    data: { userId: beto.id, workspaceId: acme.id, role: "member" },
  });
  await prisma.membership.create({
    data: { userId: carla.id, workspaceId: globex.id, role: "owner" },
  });

  const acmeBoardLaunch = await prisma.board.create({
    data: { name: "Product Launch", workspaceId: acme.id },
  });
  const acmeBoardOps = await prisma.board.create({
    data: { name: "Operations", workspaceId: acme.id },
  });

  const globexBoardRoadmap = await prisma.board.create({
    data: { name: "Q3 Roadmap", workspaceId: globex.id },
  });
  const globexBoardSupport = await prisma.board.create({
    data: { name: "Customer Support", workspaceId: globex.id },
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Draft landing page copy",
        status: "done",
        boardId: acmeBoardLaunch.id,
        assigneeId: ana.id,
      },
      {
        title: "Revisar traducciones del sitio",
        status: "doing",
        boardId: acmeBoardLaunch.id,
        assigneeId: beto.id,
      },
      {
        title: "Set up analytics tracking",
        status: "todo",
        boardId: acmeBoardLaunch.id,
      },
      {
        title: "Coordinate press release",
        status: "todo",
        boardId: acmeBoardLaunch.id,
        assigneeId: ana.id,
      },
      {
        title: "Renew office lease",
        status: "doing",
        boardId: acmeBoardOps.id,
        assigneeId: beto.id,
      },
      {
        title: "Actualizar politica de gastos",
        status: "todo",
        boardId: acmeBoardOps.id,
      },
      {
        title: "Onboard new vendor",
        status: "done",
        boardId: acmeBoardOps.id,
        assigneeId: ana.id,
      },
      {
        title: "Define Q3 OKRs",
        status: "doing",
        boardId: globexBoardRoadmap.id,
        assigneeId: carla.id,
      },
      {
        title: "Scope mobile app v2",
        status: "todo",
        boardId: globexBoardRoadmap.id,
      },
      {
        title: "Presentar roadmap al equipo",
        status: "todo",
        boardId: globexBoardRoadmap.id,
        assigneeId: carla.id,
      },
      {
        title: "Investigate refund complaints",
        status: "doing",
        boardId: globexBoardSupport.id,
        assigneeId: carla.id,
      },
      {
        title: "Update help center articles",
        status: "done",
        boardId: globexBoardSupport.id,
      },
      {
        title: "Responder tickets pendientes",
        status: "todo",
        boardId: globexBoardSupport.id,
        assigneeId: carla.id,
      },
    ],
  });

  console.log("\nSeed complete.\n");
  console.log("Users:");
  console.log(`  Ana   (${ana.email})  — owner of Acme`);
  console.log(`  Beto  (${beto.email}) — member of Acme`);
  console.log(`  Carla (${carla.email}) — owner of Globex`);
  console.log("\nWorkspaces:");
  console.log(`  Acme   -> ${acme.id}`);
  console.log(`  Globex -> ${globex.id}`);
  console.log(
    "\nNobody belongs to both workspaces. The dev stub user is Ana (Acme-only)."
  );
  console.log(
    `Try: curl http://localhost:3000/api/workspaces/${globex.id}/boards`
  );
  console.log(
    "  -> Ana can currently read Globex's boards. That's the vulnerability.\n"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
