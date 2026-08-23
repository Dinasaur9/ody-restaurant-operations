import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import type { Database } from "../src/db/client";
import {
  customers,
  menuCategories,
  menuItems,
  orderItems,
  orderingSettings,
  orders,
} from "../src/db/schema";

const directory = dirname(fileURLToPath(import.meta.url));
const migrationPath = resolve(directory, "../drizzle/0000_initial.sql");
const client = new PGlite();
const testDatabase = drizzle(client);
const app = createApp(testDatabase as unknown as Database);

const request = (
  path: string,
  init?: RequestInit,
) => app.request(path, init, { CORS_ORIGIN: "http://localhost:8081" });

async function resetFixture() {
  await testDatabase.delete(orderItems);
  await testDatabase.delete(orders);
  await testDatabase.delete(menuItems);
  await testDatabase.delete(menuCategories);
  await testDatabase.delete(customers);
  await testDatabase.delete(orderingSettings);

  const [category] = await testDatabase
    .insert(menuCategories)
    .values({ name: "Mains", position: 1 })
    .returning();
  if (!category) throw new Error("Test category was not created");

  await testDatabase.insert(menuItems).values([
    {
      id: 1,
      categoryId: category.id,
      name: "Truffle rigatoni",
      description: "Wild mushrooms and pecorino",
      price: 1850,
      prepMinutes: 16,
      isAvailable: true,
    },
    {
      id: 2,
      categoryId: category.id,
      name: "Garden grain bowl",
      description: "Temporarily sold out",
      price: 1550,
      prepMinutes: 10,
      isAvailable: false,
    },
  ]);

  await testDatabase.insert(customers).values({
    id: 1,
    name: "Maya Chen",
    email: "maya.test@example.com",
  });

  await testDatabase.insert(orderingSettings).values({
    id: 1,
    restaurantName: "Test Kitchen",
    prepTimeMinutes: 20,
    serviceEnabled: true,
    autoAcceptOrders: false,
    openingTime: "09:00",
    closingTime: "22:00",
  });
}

beforeAll(async () => {
  await client.exec(await readFile(migrationPath, "utf8"));
});

beforeEach(resetFixture);

describe("order API integration", () => {
  it("ignores client pricing and calculates the persisted menu total", async () => {
    const response = await request("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: 1,
        customerName: "Maya Chen",
        channel: "pickup",
        items: [{ menuItemId: 1, quantity: 2 }],
        subtotal: 1,
        total: 1,
      }),
    });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      customerName: "Maya Chen",
      status: "pending",
      subtotal: 3700,
      total: 3700,
      items: [
        {
          name: "Truffle rigatoni",
          unitPrice: 1850,
          quantity: 2,
          total: 3700,
        },
      ],
      availableActions: ["accepted", "cancelled"],
    });
  });

  it("rejects a currently unavailable menu item", async () => {
    const response = await request("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: "Walk-in guest",
        channel: "dine_in",
        items: [{ menuItemId: 2, quantity: 1 }],
      }),
    });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toMatchObject({
      error: {
        code: "MENU_ITEM_UNAVAILABLE",
        message: "Garden grain bowl is currently unavailable.",
      },
    });
  });

  it("performs a valid action and rejects a skipped status", async () => {
    const createResponse = await request("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: "Maya Chen",
        channel: "delivery",
        items: [{ menuItemId: 1, quantity: 1 }],
      }),
    });
    const created = await createResponse.json() as { id: number };

    const acceptResponse = await request(`/api/orders/${created.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "accepted" }),
    });
    expect(acceptResponse.status).toBe(200);
    expect(await acceptResponse.json()).toMatchObject({
      status: "accepted",
      availableActions: ["preparing", "cancelled"],
    });

    const skipResponse = await request(`/api/orders/${created.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ready" }),
    });
    expect(skipResponse.status).toBe(409);
    expect(await skipResponse.json()).toMatchObject({
      error: { code: "INVALID_ORDER_TRANSITION" },
    });
  });

  it("filters the operational order list", async () => {
    await testDatabase.insert(orders).values([
      {
        displayId: "OD-TEST-1",
        customerName: "Maya Chen",
        channel: "pickup",
        status: "accepted",
        subtotal: 1850,
        total: 1850,
      },
      {
        displayId: "OD-TEST-2",
        customerName: "Another Guest",
        channel: "delivery",
        status: "completed",
        subtotal: 1850,
        total: 1850,
      },
    ]);

    const response = await request(
      "/api/orders?status=accepted&channel=pickup&search=Maya",
    );
    const body = await response.json() as Array<{ displayId: string }>;

    expect(response.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0]?.displayId).toBe("OD-TEST-1");
  });
});
