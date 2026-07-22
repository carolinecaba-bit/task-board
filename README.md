# Team Task Board — BLD15N starter (Module 05: Security & Auth)

A Trello-lite team task board built with **Next.js (App Router)**, **Prisma**, and
**SQLite**. It's a fully working app — boards, drag-and-drop cards, light/dark theme,
EN/ES UI.

> Status on this branch (`feat/jwt-auth-users`): **AuthN is implemented** (real
> login, JWT session cookie, 401s on every protected route). **Multitenancy and
> the board-delete AuthZ check are still open** — see
> [`VULN_MAP.md`](./VULN_MAP.md); they're the subject of a follow-up branch/PR.

## Auth & Users (this branch)

- **Login** — email + password, `POST /api/auth/login`. Passwords are hashed with
  bcrypt (`passwordHash` on `User`). On success, a JWT is signed
  (`lib/jwt.ts`) and set as an httpOnly cookie (`session`).
- **`getCurrentUser()`** (`lib/current-user.ts`) now reads that cookie and
  returns the real signed-in user, or `null` for anyone without a valid
  session — every route under `app/api/**` checks for `null` and returns
  `401` before touching the database.
- **Login screen** at `/login` (`app/login/page.tsx` + `components/LoginForm.tsx`);
  `app/page.tsx` redirects there when signed out. `TopBar` shows the real user
  and a logout button.
- **Users section** — any workspace **owner** gets a ⚙ button next to that
  workspace's name in the sidebar, opening a panel
  (`components/MembersModal.tsx`) to add a user (creating the account with a
  generated temporary password if it doesn't exist yet), change a member's
  role (`owner`/`member`), or remove them — backed by
  `POST/PATCH/DELETE /api/workspaces/[id]/members[/[userId]]`, all
  owner-gated. A workspace always keeps at least one owner.
- **Seed accounts** (see "Running it" below) all share the password
  `password123` for local dev.

## What's actually missing

- **Multitenancy** — the database has two workspaces ("Acme" and "Globex") that
  share nothing, but every API route queries by `workspaceId` / `boardId` directly
  with **no check** that the current user actually belongs to that workspace. Any
  user can read or write any workspace's data.
- **AuthZ** — a couple of actions (deleting a board) are meant to be owner-only, but
  there's no role check anywhere, so any member can do them.

Every place this matters is marked in the code with a `// VULN(...)` comment. See
[`VULN_MAP.md`](./VULN_MAP.md) for the full list, and [`EXERCISE.md`](./EXERCISE.md)
for the assignment that walks you through fixing all of it.

## Stack

- Next.js (App Router, TypeScript), route handlers under `app/api/**`
- Prisma ORM + SQLite (`prisma/dev.db`, gitignored)
- `@dnd-kit` for drag-and-drop
- Tailwind CSS, themed through CSS variables (light/dark/system)
- A small hand-rolled i18n dictionary (`es` default, `en` toggle in the top bar)

No auth library (NextAuth/Auth.js, Lucia, etc.) — this branch hand-rolls a
minimal JWT-in-httpOnly-cookie session with `jsonwebtoken` + `bcryptjs`
instead. See "Auth & Users" above for why.

## Running it

```bash
npm install
npx prisma migrate dev   # creates prisma/dev.db and applies the schema
npm run seed              # wipes and reseeds demo data, prints workspace IDs
npm run dev                # http://localhost:3000
```

The dev server needs Node 18.18+ (Next.js requirement). Optionally set
`JWT_SECRET` in your environment before starting the server — without it,
`lib/jwt.ts` falls back to an obviously-fake dev secret (fine for local dev,
**never for anything deployed**).

### Seed data

- **Users:** Ana (`ana@acme.test`), Beto (`beto@acme.test`), Carla (`carla@globex.test`)
  — **password `password123` for all three**
- **Workspaces:** Acme, Globex — **nobody belongs to both**
- **Memberships:** Ana = owner of Acme · Beto = member of Acme · Carla = owner of Globex
- Each workspace has 2 boards with 3–4 tasks each, mixed statuses, a couple of
  Spanish task titles mixed in

Log in as Ana to see the ⚙ "manage users" button on Acme (she's its owner); Beto
won't see it on Acme (member, not owner). Run `npm run seed` again any time to
reset the database and reprint fresh workspace IDs.

## Try the vulnerability

With the dev server running and the database freshly seeded, grab the Globex
workspace ID from the seed output (or from `GET /api/workspaces`), then ask for its
boards while logged in as Ana — an Acme-only user:

```bash
curl http://localhost:3000/api/workspaces/<globex-workspace-id>/boards
```

Example run against this repo's seed data:

```
$ curl http://localhost:3000/api/workspaces/cmrwl55bf000442kn7gsqug98/boards
{"boards":[
  {"id":"cmrwl55kq000g42kn5p5rutzr","name":"Q3 Roadmap","workspaceId":"cmrwl55bf000442kn7gsqug98", ...},
  {"id":"cmrwl55m5000i42kn80bdko5x","name":"Customer Support","workspaceId":"cmrwl55bf000442kn7gsqug98", ...}
]}
```

Ana gets Globex's boards back, in full — she's never been a member of that
workspace. Nothing in the request proves who's asking, and nothing in the query
checks whether they're allowed to ask. That's the whole exercise in one `curl`.

## Project layout

```
app/
  api/                    # route handlers — all currently open, see VULN_MAP.md
  page.tsx                # renders the board app for getCurrentUser()
components/                # UI: sidebar, board, columns, cards, modal, theme/lang toggles
lib/
  current-user.ts          # <-- AUTH SEAM. Replace this.
  prisma.ts                 # Prisma client singleton
  i18n/                      # es/en dictionaries + context
  theme.tsx                  # light/dark/system theme provider
prisma/
  schema.prisma              # User / Workspace / Membership / Board / Task
  seed.ts                     # reseeds demo data
```

## Docs

- [`EXERCISE.md`](./EXERCISE.md) — the staged assignment (AuthN → Multitenancy → AuthZ)
- [`VULN_MAP.md`](./VULN_MAP.md) — every `// VULN(...)` marker, where it lives, and
  what slide concept it maps to
