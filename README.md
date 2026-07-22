# Team Task Board — BLD15N starter (Module 05: Security & Auth)

A Trello-lite team task board built with **Next.js (App Router)**, **Prisma**, and
**SQLite**. It's a fully working app — boards, drag-and-drop cards, light/dark theme,
EN/ES UI — with one deliberate catch: **it ships with no authentication and no
multitenancy**. Those are the two things you'll build in this module.

## What's actually missing

- **AuthN** — there's no login screen, no session, no password anywhere. Every
  request is treated as the same hardcoded user (Ana), defined in
  `lib/current-user.ts`.
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

No auth library, no NextAuth/Auth.js, no JWT — that's on purpose. Pick whatever
approach you want for the exercise.

## Running it

```bash
npm install
npx prisma migrate dev   # creates prisma/dev.db and applies the schema
npm run seed              # wipes and reseeds demo data, prints workspace IDs
npm run dev                # http://localhost:3000
```

The dev server needs Node 18.18+ (Next.js requirement).

### Seed data

- **Users:** Ana (`ana@acme.test`), Beto (`beto@acme.test`), Carla (`carla@globex.test`)
- **Workspaces:** Acme, Globex — **nobody belongs to both**
- **Memberships:** Ana = owner of Acme · Beto = member of Acme · Carla = owner of Globex
- Each workspace has 2 boards with 3–4 tasks each, mixed statuses, a couple of
  Spanish task titles mixed in

The dev-stub user (`getCurrentUser()`) is always **Ana**, an Acme-only user. Run
`npm run seed` again any time to reset the database and reprint fresh workspace IDs.

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
