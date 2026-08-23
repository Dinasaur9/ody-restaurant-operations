import { describe, expect, it } from "vitest";
import type { CustomerWithHistory, MenuItem } from "@ody/api-client";
import {
  calculateOrderEstimate,
  filterCustomers,
  filterMenuItems,
  getStatusTone,
} from "./view-models";

const customer = {
  id: 1,
  name: "Maya Chen",
  email: "maya@example.com",
  phone: "+33 6 14 22 91 08",
  createdAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-01T00:00:00.000Z",
  orderCount: 3,
  totalSpend: 5400,
  averageOrder: 1800,
  lastOrderAt: "2026-08-22T12:00:00.000Z",
  recentOrders: [],
} satisfies CustomerWithHistory;

const menu = [
  {
    id: 1,
    categoryId: 1,
    name: "Rigatoni",
    description: "",
    price: 1850,
    prepMinutes: 15,
    isAvailable: true,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
  },
  {
    id: 2,
    categoryId: 1,
    name: "Sold-out bowl",
    description: "",
    price: 1550,
    prepMinutes: 10,
    isAvailable: false,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
  },
] satisfies MenuItem[];

describe("dashboard view models", () => {
  it("maps operational statuses to semantic UI tones", () => {
    expect(getStatusTone("pending")).toBe("warning");
    expect(getStatusTone("preparing")).toBe("primary");
    expect(getStatusTone("completed")).toBe("success");
    expect(getStatusTone("cancelled")).toBe("danger");
  });

  it("finds customers by name, email, or phone without case sensitivity", () => {
    expect(filterCustomers([customer], "maya")).toEqual([customer]);
    expect(filterCustomers([customer], "EXAMPLE.COM")).toEqual([customer]);
    expect(filterCustomers([customer], "91 08")).toEqual([customer]);
    expect(filterCustomers([customer], "not present")).toEqual([]);
  });

  it("finds menu items by name without case sensitivity", () => {
    expect(filterMenuItems(menu, "rigatoni")).toEqual([menu[0]]);
    expect(filterMenuItems(menu, "SOLD-OUT")).toEqual([menu[1]]);
    expect(filterMenuItems(menu, "not present")).toEqual([]);
    expect(filterMenuItems(menu, "")).toEqual(menu);
  });

  it("estimates from available persisted menu prices only", () => {
    expect(calculateOrderEstimate(menu, { 1: 2, 2: 5 })).toBe(3700);
  });

  it("does not allow negative quantities to reduce an estimate", () => {
    expect(calculateOrderEstimate(menu, { 1: -2 })).toBe(0);
  });
});
