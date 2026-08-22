import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import type { Database } from "./db/client";
import type { Env } from "./env";
import { errorResponse } from "./http/errors";
import { HealthSchema, jsonResponse } from "./http/schemas";

type AppBindings = {
  Bindings: Env;
  Variables: {
    requestId: string;
    db: Database;
  };
};

const healthRoute = createRoute({
  method: "get",
  path: "/health",
  operationId: "getHealth",
  summary: "Check API health",
  description: "Returns service health without querying the database.",
  tags: ["System"],
  responses: {
    200: jsonResponse(HealthSchema),
  },
});

export function createApp(database: Database) {
  const app = new OpenAPIHono<AppBindings>({
    defaultHook: (result, context) => {
      if (!result.success) {
        return context.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "The request did not match the API contract.",
              requestId: context.get("requestId"),
              details: result.error.flatten(),
            },
          },
          422,
        );
      }
    },
  });

  app.use("*", requestId());
  app.use("*", logger());
  app.use(
    "/api/*",
    cors({
      origin: (origin, context) => context.env.CORS_ORIGIN ?? origin ?? "*",
      allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
      allowHeaders: ["Content-Type", "X-Request-Id"],
      exposeHeaders: ["X-Request-Id"],
      maxAge: 600,
    }),
  );
  app.use("/api/*", async (context, next) => {
    context.set("db", database);
    await next();
  });

  app.onError(errorResponse);
  app.notFound((context) =>
    context.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "The requested resource does not exist.",
          requestId: context.get("requestId"),
        },
      },
      404,
    ),
  );

  app.openapi(healthRoute, (context) =>
    context.json({
      status: "ok" as const,
      service: "ody-restaurant-api" as const,
      version: "0.1.0",
      timestamp: new Date().toISOString(),
    }),
  );

  app.doc("/openapi.json", {
    openapi: "3.1.0",
    info: {
      title: "Ody Restaurant Operations API",
      version: "0.1.0",
      description:
        "Typed API for restaurant menu, orders, customers, and ordering settings.",
    },
    servers: [
      { url: "http://localhost:8787", description: "Local development" },
    ],
    tags: [
      { name: "System", description: "Service health and metadata" },
      { name: "Menu", description: "Menu categories and items" },
      { name: "Orders", description: "Ordering and kitchen workflow" },
      { name: "CRM", description: "Customer activity and value" },
      { name: "Settings", description: "Ordering configuration" },
      { name: "Dashboard", description: "Restaurant performance summaries" },
    ],
  });

  app.get(
    "/docs",
    apiReference({
      pageTitle: "Ody Restaurant API",
      theme: "saturn",
      url: "/openapi.json",
    }),
  );

  return app;
}

export type App = ReturnType<typeof createApp>;
