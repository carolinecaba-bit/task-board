-- AlterTable
-- Adds the password hash column backing email+password login (see lib/jwt.ts,
-- app/api/auth/login/route.ts). Defaults to '' only so this migration can
-- apply cleanly to a table that may already have rows; every real row gets a
-- proper bcrypt hash via `npm run seed` (or the new-user flow in
-- POST /api/workspaces/[id]/members), never left as the placeholder.
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT NOT NULL DEFAULT '';
