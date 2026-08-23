import { describe, expect, it } from "vitest";
import { OrderPricingError, priceOrder } from "./order-pricing";

const menu = [
  { id: 1, name: "Truffle rigatoni", price: 1850, isAvailable: true },
  { id: 2, name: "Garden grain bowl", price: 1550, isAvailable: false },
];

describe("server-side order pricing", () => {
  it("calculates line and order totals from persisted menu prices", () => {
    expect(priceOrder([{ menuItemId: 1, quantity: 2 }], menu)).toEqual({
      items: [
        {
          menuItemId: 1,
          name: "Truffle rigatoni",
          unitPrice: 1850,
          quantity: 2,
          total: 3700,
        },
      ],
      subtotal: 3700,
      serviceFee: 0,
      total: 3700,
    });
  });

  it("combines repeated item identifiers before pricing", () => {
    const result = priceOrder(
      [
        { menuItemId: 1, quantity: 1 },
        { menuItemId: 1, quantity: 2 },
      ],
      menu,
    );

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({ quantity: 3, total: 5550 });
  });

  it("rejects unavailable menu items", () => {
    expect(() => priceOrder([{ menuItemId: 2, quantity: 1 }], menu)).toThrowError(
      expect.objectContaining<Partial<OrderPricingError>>({
        code: "MENU_ITEM_UNAVAILABLE",
      }),
    );
  });

  it("rejects menu items that are not persisted", () => {
    expect(() => priceOrder([{ menuItemId: 999, quantity: 1 }], menu)).toThrowError(
      expect.objectContaining<Partial<OrderPricingError>>({
        code: "MENU_ITEM_NOT_FOUND",
      }),
    );
  });

  it("rejects quantities above the per-item limit after combining lines", () => {
    expect(() =>
      priceOrder(
        [
          { menuItemId: 1, quantity: 20 },
          { menuItemId: 1, quantity: 6 },
        ],
        menu,
      ),
    ).toThrowError(
      expect.objectContaining<Partial<OrderPricingError>>({
        code: "INVALID_QUANTITY",
      }),
    );
  });
});
