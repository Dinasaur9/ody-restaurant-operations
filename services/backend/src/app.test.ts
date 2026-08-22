import { describe, expect, it } from "vitest";
import { createApp } from "./app";
import type { Database } from "./db/client";

const app = createApp({} as Database);

describe("API foundation", () => {
  it("reports service health", async () => {
    const response = await app.request("/health");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      status: "ok",
      service: "ody-restaurant-api",
    });
  });

  it("publishes an OpenAPI 3.1 contract", async () => {
    const response = await app.request("/openapi.json");
    const body = (await response.json()) as {
      openapi: string;
      paths: Record<string, unknown>;
    };

    expect(body.openapi).toBe("3.1.0");
    expect(body.paths).toHaveProperty("/health");
  });

  it("returns a consistent missing-resource error", async () => {
    const response = await app.request("/does-not-exist");
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toMatchObject({
      error: {
        code: "NOT_FOUND",
        message: "The requested resource does not exist.",
      },
    });
  });
});
