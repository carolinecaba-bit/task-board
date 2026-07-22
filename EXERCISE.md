# Exercise — Module 05: Security & Auth

You've got a working task board with two holes in it: **anyone can be anyone**, and
**anyone can see everyone's data**. Your job is to close both, plus a smaller
role-based gap, in three stages. Do them in order — each one builds on the last.

Before you start, run the app and reproduce the leak described in the "Try the
vulnerability" section of the [`README`](./README.md). You should be able to explain,
in one sentence, why that `curl` returns data it shouldn't. If you can't, re-read
`lib/current-user.ts` and `app/api/workspaces/[id]/boards/route.ts` before writing
any code.

## Part 1 — AuthN (Authentication)

**Goal:** replace the hardcoded stub with real login, and make protected routes
reject unauthenticated requests.

1. Pick an approach — NextAuth/Auth.js, Lucia, iron-session, or your own
   cookie + JWT setup are all fine. Add a real login flow (it doesn't need to be
   pretty; a simple email-based login is enough).
2. Replace the body of `getCurrentUser()` in `lib/current-user.ts` so it reads the
   real session/token from the request and returns the actual signed-in user,
   instead of always returning Ana.
3. Every route handler under `app/api/**` currently has a comment like:

   ```ts
   // VULN(authn): route trusts getCurrentUser() unconditionally and never returns 401.
   ```

   Find each one and add a check: if there's no valid session, return
   **401 Unauthorized** before touching the database.
4. Update the top-bar banner (`components/TopBar.tsx`) and the `AppShell` so the
   UI reflects the real signed-in user instead of a hardcoded prop, and add a
   login screen for signed-out visitors.

**Acceptance check:** an unauthenticated request to any protected API route (e.g.
`GET /api/workspaces` with no session cookie) returns `401`.

## Part 2 — Multitenancy

**Goal:** a signed-in user should only ever see workspaces (and their boards and
tasks) that they're actually a member of.

1. Search the codebase for `// VULN(multitenancy)`. You'll find it above every
   query that fetches by `workspaceId` or `boardId` with no ownership check.
2. For each one, add a membership check before running the query. The pattern is
   the same everywhere: given the current user and a `workspaceId` (fetched
   directly, or derived by walking `task -> board -> workspace`), confirm a
   `Membership` row exists for that `(userId, workspaceId)` pair. If it doesn't,
   return `404` (don't leak that the resource exists at all) or `403`.
3. Pay special attention to `app/api/tasks/[id]/route.ts` — the task id alone
   doesn't tell you the workspace. You'll need to look up the task's board, and
   the board's `workspaceId`, before you can check membership. This is also
   flagged as an **IDOR** (Insecure Direct Object Reference): any caller who
   knows or guesses a task id can currently edit or delete it.
4. `GET /api/workspaces` should only return workspaces the current user belongs
   to — right now it returns all of them.

**Acceptance check:** log in as Ana (Acme-only) and confirm she can no longer read
Globex's workspace, boards, or tasks — every one of those requests should now
404 or 403. Re-run the `curl` from the README and confirm it's fixed.

## Part 3 — AuthZ (Authorization / roles)

**Goal:** some actions should only be available to workspace owners, not regular
members.

1. Search for `// VULN(authz)`. You'll find it on `DELETE /api/boards/[id]` —
   deleting a board is meant to be an owner-only action.
2. After confirming the current user is a member of the board's workspace (Part
   2), also check their `role` on that `Membership` row. If it isn't `"owner"`,
   return `403 Forbidden`.
3. Think about whether any other actions in the app should be owner-gated (e.g.
   removing a member, renaming the workspace) if you add those features — the
   same pattern applies.

**Acceptance check:** log in as Beto (a *member*, not owner, of Acme) and confirm
that deleting an Acme board returns `403`. Confirm Ana (the owner) can still do it.

## Summary of acceptance checks

- [ ] An unauthenticated request to a protected route gets `401`.
- [ ] Ana can no longer read Globex's workspaces, boards, or tasks.
- [ ] A task's id alone is no longer enough to read/edit/delete it across
      workspaces (IDOR fixed).
- [ ] `GET /api/workspaces` only returns workspaces the caller belongs to.
- [ ] Beto (member) gets `403` deleting an Acme board; Ana (owner) can still
      delete it.
