import { serve } from "@hono/node-server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createApp } from "./app";
import type { Database } from "./db/client";
import * as schema from "./db/schema";

const databaseUrl = process.env.DATABASE_URL;
const port = Number(process.env.PORT ?? 8787);

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required. Copy .env.example to .env before starting the API.",
  );
}

const client = postgres(databaseUrl);
const database = drizzle(client, { schema }) as unknown as Database;
const app = createApp(database, process.env.CORS_ORIGIN);

const server = serve({
  fetch: app.fetch,
  port,
});

console.log(`Ody API listening on http://localhost:${port}`);
console.log(`API reference: http://localhost:${port}/docs`);

async function shutdown() {
  server.close();
  await client.end();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
