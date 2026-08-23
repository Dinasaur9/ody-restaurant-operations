# Ody Restaurant Operations

A focused full-stack restaurant operations product built for the Odyssey
engineering assessment. It gives restaurant teams a live overview, deliberate
order workflow, menu management, customer CRM, and ordering controls through a
polished Expo dashboard.

## Product tour

- **Home** — revenue, order volume, active work, average order value, popular
  dishes, and recent activity.
- **Orders** — search and filters, itemized details, valid kitchen actions, and
  a server-priced create flow.
- **Menu** — categorized catalogue, item/category creation, editing, price and
  preparation-time management, and immediate availability control.
- **CRM** — guest search, spend, frequency, average value, contact details, and
  recent order history.
- **Settings** — service availability, auto-accept, preparation time, restaurant
  identity, and opening hours.
- **UI Library** — tokens, typography, spacing, surfaces, primitives, and product
  states in one dedicated route.
- **Global search, notifications, and account menu** — available from every page
  header. Search queries orders, menu items, and customers together and
  deep-links results into the right page. Notifications lists orders awaiting
  acceptance.

## Stack

- pnpm workspace and Turborepo
- Expo, React Native, React Native Web, and Expo Router
- Hono on Cloudflare Workers
- PostgreSQL with Drizzle ORM
- `drizzle-zod` and Zod
- Hono OpenAPI and Scalar API reference
- Orval-generated models and React Query hooks
- Vitest and PGlite for unit and database-backed integration tests

## Repository structure

```text
apps/dashboard       Expo + React Native Web operations dashboard
services/backend     Hono Cloudflare Worker and Drizzle persistence
packages/api-client  OpenAPI document and Orval-generated hooks/models
packages/shared      Cross-application utilities
packages/types       Shared domain constants and lifecycle definitions
packages/ui          Cross-platform design tokens and reusable primitives
```

## Architecture

Persisted truth and frontend contracts follow one direction:

```text
Drizzle schema
    ↓
drizzle-zod request/response foundations
    ↓
Hono OpenAPI routes
    ↓
packages/api-client/openapi.json
    ↓
Orval-generated models and React Query hooks
    ↓
Dashboard orchestration hooks
    ↓
Focused presentational screens and shared UI primitives
```

The dashboard does not maintain handwritten copies of backend DTOs and does not
use raw `fetch` as its data-access pattern. Generated artifacts live under
`packages/api-client/src/generated` and should never be edited manually.

Order prices, names, line totals, and final totals are resolved by the backend
from persisted menu data. An order status is not a loose editable field: the
backend only permits explicit transitions:

```text
Pending → Accepted → Preparing → Ready → Completed
    └──────────────→ Cancelled
```

Cancellation is available only before preparation begins. Completed and
cancelled orders are terminal.

## Prerequisites

- Node.js 20 or later
- pnpm 10
- Docker Desktop for the local PostgreSQL workflow

The repository pins pnpm through Corepack. Enable it if your shell already
allows Corepack to install global shims:

```bash
corepack enable
corepack prepare pnpm@10.15.0 --activate
```

On a locked-down Windows installation, `corepack enable` may require an
Administrator terminal. Every documented command can instead be prefixed with
`corepack`, for example `corepack pnpm test`; no global pnpm install is needed.

## Local setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy the environment example:

   PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   macOS/Linux:

   ```bash
   cp .env.example .env
   ```

3. Start PostgreSQL, apply migrations, and seed reviewer data:

   ```bash
   pnpm db:setup
   ```

4. Start the API in one terminal:

   ```bash
   pnpm dev:backend
   ```

5. Start the web dashboard in another terminal:

   ```bash
   pnpm dev:dashboard
   ```

6. Open the URL printed by Expo, normally `http://localhost:8081`.

The API is available at `http://localhost:8787`. Interactive documentation is
at `http://localhost:8787/docs`, and the OpenAPI document is at
`http://localhost:8787/openapi.json`.

The local API uses Hono's Node adapter and the direct PostgreSQL driver, so it
connects to the Docker database in `.env`. To exercise the Cloudflare Worker
runtime against a Neon database instead, run `pnpm --filter @ody/backend
dev:worker` with an appropriate Worker `DATABASE_URL` binding.

## Seed data

`pnpm db:seed` resets and recreates a deterministic “Atelier Ody” workspace:

- 4 categories and 8 menu items
- available and unavailable dishes
- 5 customers with different lifetime values
- 8 orders across pickup, delivery, and dine-in
- every relevant kitchen status, including cancellation
- ordering hours, preparation time, and service controls

The seed command is intentionally destructive to the configured database and is
for local review/development only.

## Contract generation

After changing the Drizzle-derived API contract:

```bash
pnpm gen:contract
```

This first generates `packages/api-client/openapi.json` from Hono, then asks
Orval to regenerate models, request functions, and React Query hooks.

## Quality commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Useful focused commands:

```bash
pnpm --filter @ody/backend test
pnpm --filter @ody/dashboard build
pnpm --filter @ody/api-client typecheck
```

Backend integration tests run the real initial PostgreSQL migration in PGlite
and exercise Hono routes, Drizzle queries, transactions, validation, server-side
pricing, filters, and lifecycle conflicts together.

## Cloudflare deployment notes

The Worker runtime uses the Neon serverless HTTP driver. Provide `DATABASE_URL`
as a Worker secret and set `CORS_ORIGIN` to the deployed dashboard origin before
deploying with Wrangler. Local migration and seed commands use the direct
PostgreSQL driver against Docker.

## Design decisions

- Warm neutral surfaces support long operational sessions without feeling like
  a generic admin template.
- Violet identifies primary actions and selected navigation; lime is reserved
  for live operational emphasis.
- Monetary values are stored as integer cents.
- Order items snapshot name and unit price so historical receipts remain stable
  when a menu changes.
- List screens expose clear loading, empty, error, and retry patterns.
- Mutation logic and cache invalidation live in hooks rather than page bodies.
- The UI package uses React Native primitives so it remains native-ready while
  the assessment’s primary review surface is web.

## Scope and tradeoffs

- Authentication, authorization, roles, and multi-tenant isolation are outside
  this assessment slice. A production version would scope every query by
  workspace and enforce role-based actions.
- Live order changes currently use React Query invalidation/refetching rather
  than WebSockets or server-sent events.
- Opening hours model one daily service window and do not yet cover split or
  overnight service.
- Pagination is omitted because the seeded review dataset is deliberately small;
  cursor pagination would be added before high-volume use.
- Taxes, discounts, payment capture, delivery addresses, and refunds are outside
  the ordering slice.
- Web is fully supported. Shared primitives and responsive layout preserve
  native readiness, but native builds were not a primary deliverable.

## Reviewer shortcuts

- Dashboard: `http://localhost:8081/home`
- Order operations: `http://localhost:8081/orders`
- UI library: `http://localhost:8081/ui-library`
- API reference: `http://localhost:8787/docs`
