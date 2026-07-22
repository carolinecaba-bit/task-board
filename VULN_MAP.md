# VULN_MAP

Every `// VULN(...)` marker in the codebase, where it lives, and which slide concept
it maps to. Use this as a checklist alongside [`EXERCISE.md`](./EXERCISE.md).

| Marker | File | Concept |
|---|---|---|
| `VULN(authn)` | `app/api/workspaces/route.ts` — `GET` | AuthN |
| `VULN(multitenancy)` | `app/api/workspaces/route.ts` — `GET` | Multitenancy |
| `VULN(authn)` | `app/api/workspaces/[id]/boards/route.ts` — `GET` | AuthN |
| `VULN(multitenancy)` | `app/api/workspaces/[id]/boards/route.ts` — `GET` | Multitenancy |
| `VULN(authn)` | `app/api/workspaces/[id]/members/route.ts` — `GET` | AuthN |
| `VULN(multitenancy)` | `app/api/workspaces/[id]/members/route.ts` — `GET` | Multitenancy |
| `VULN(authn)` | `app/api/boards/[id]/tasks/route.ts` — `GET` | AuthN |
| `VULN(multitenancy)` | `app/api/boards/[id]/tasks/route.ts` — `GET` | Multitenancy |
| `VULN(authn)` | `app/api/boards/[id]/tasks/route.ts` — `POST` | AuthN |
| `VULN(multitenancy)` | `app/api/boards/[id]/tasks/route.ts` — `POST` | Multitenancy |
| `VULN(authn)` | `app/api/tasks/[id]/route.ts` — `PATCH` | AuthN |
| `VULN(multitenancy)` / IDOR | `app/api/tasks/[id]/route.ts` — `PATCH` | Multitenancy, IDOR |
| `VULN(authn)` | `app/api/tasks/[id]/route.ts` — `DELETE` | AuthN |
| `VULN(multitenancy)` / IDOR | `app/api/tasks/[id]/route.ts` — `DELETE` | Multitenancy, IDOR |
| `VULN(authn)` | `app/api/boards/[id]/route.ts` — `DELETE` | AuthN |
| `VULN(multitenancy)` | `app/api/boards/[id]/route.ts` — `DELETE` | Multitenancy |
| `VULN(authz)` | `app/api/boards/[id]/route.ts` — `DELETE` | AuthZ (owner-only action) |

## The auth seam

`lib/current-user.ts` — `getCurrentUser()` is the single hardcoded stub every route
calls. It always returns Ana regardless of who's actually asking. This is where real
session/token lookup plugs in; see the comment block in that file for details.

## Counts by concept

- **AuthN:** 9 call sites (every route handler)
- **Multitenancy:** 8 call sites
- **AuthZ:** 1 call site (`DELETE /api/boards/[id]`)
- **IDOR (subset of multitenancy):** 2 call sites (`PATCH`/`DELETE` on
  `/api/tasks/[id]`, where the task id alone crosses workspace boundaries)
