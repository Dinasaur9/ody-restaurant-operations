# Submission — Ody Restaurant Operations

## GitHub repository

https://github.com/Dinasaur9/ody-restaurant-operations (public)

## Instructions to run locally

Prerequisites: Node.js 20+, pnpm 10 (via Corepack), Docker Desktop.

```bash
corepack enable
corepack prepare pnpm@10.15.0 --activate

pnpm install

# copy the env example
cp .env.example .env          # macOS/Linux
Copy-Item .env.example .env   # PowerShell

pnpm db:setup                 # starts Postgres in Docker, runs migrations, seeds data

pnpm dev:backend               # terminal 1 — API at http://localhost:8787
pnpm dev:dashboard              # terminal 2 — dashboard at http://localhost:8081
```

Open the URL Expo prints (normally `http://localhost:8081/home`). API docs live at
`http://localhost:8787/docs`; the OpenAPI document is at
`http://localhost:8787/openapi.json`.

On a locked-down Windows shell where `corepack enable` needs Administrator
rights, every command above can instead be prefixed with `corepack`
(e.g. `corepack pnpm test`) with no global pnpm install required.

Quality/build commands, if useful during review:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Instructions to seed data

```bash
pnpm db:seed
```

Resets and recreates a deterministic **"Atelier Ody"** workspace:

- 4 categories, 8 menu items (including one unavailable dish)
- 5 customers with different lifetime values
- 8 orders spanning pickup, delivery, and dine-in
- every relevant order status, including a cancellation
- default ordering hours, prep time, and service controls

This command is intentionally destructive to whatever is in the configured
database — it's meant for local review/development only, and can be re-run
at any time to return to a clean state.

## Architecture decisions

- **Contract flow is real, not aspirational**: `Drizzle schema → drizzle-zod →
  Hono OpenAPI routes → packages/api-client/openapi.json → Orval-generated
  models/hooks → dashboard orchestration hooks → presentational screens`.
  Verified end-to-end — for example, the backend's Postgres enum for order
  status and the frontend's status labels both import from the same
  `packages/types` source, so there's exactly one place order statuses are
  defined, not three.
- **Orders are server-priced and server-gated.** The client never sets a
  price or a final total; the backend recalculates from persisted menu data
  and rejects orders containing unavailable items. Status is not a loose
  client-editable field — the backend only permits explicit transitions
  (`Pending → Accepted → Preparing → Ready → Completed`, with cancellation
  available only before preparation begins).
- **Business logic lives in hooks, not screens.** `useOrderOperations`,
  `useMenuOperations`, and `useSettingsOperations` own mutations, cache
  invalidation, and local form state; page components stay focused on
  layout and presentation.
- **Design tokens are centralized** in `packages/ui`, which also hosts every
  reusable primitive (buttons, fields, selects, dialogs/drawers, cards,
  data lists, badges, navigation, skeletons, toasts) and a dedicated
  `/ui-library` route that showcases all of it, including component states.
- **Monetary values are stored as integer cents**, and order line items
  snapshot the item's name and unit price at order time, so historical
  orders stay accurate even if the menu changes later.
- **The UI package uses React Native primitives** (not web-only markup) so
  it stays native-ready, even though the assessment's primary review
  surface is web.

## Tradeoffs and incomplete areas

- **No authentication, authorization, roles, or multi-tenancy** — out of
  scope for this slice. A production version would scope every query by
  workspace and enforce role-based actions.
- **Live updates use React Query invalidation/refetching**, not
  WebSockets or server-sent events.
- **Opening hours model a single daily window** — no split or overnight
  service yet.
- **No pagination** — the seeded review dataset is deliberately small;
  cursor pagination would be added before real volume.
- **No taxes, discounts, payment capture, delivery addresses, or
  refunds** — outside the ordering slice as scoped.
- **Web is the fully supported surface.** Shared primitives and responsive
  layout preserve native readiness, but native builds weren't a primary
  deliverable.
