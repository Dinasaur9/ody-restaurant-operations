export interface OrderLineInput {
  menuItemId: number;
  quantity: number;
}

export interface PriceableMenuItem {
  id: number;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface PricedOrderLine {
  menuItemId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export class OrderPricingError extends Error {
  constructor(
    public readonly code:
      | "EMPTY_ORDER"
      | "INVALID_QUANTITY"
      | "MENU_ITEM_NOT_FOUND"
      | "MENU_ITEM_UNAVAILABLE",
    message: string,
    public readonly menuItemId?: number,
  ) {
    super(message);
    this.name = "OrderPricingError";
  }
}

export function priceOrder(
  requestedLines: readonly OrderLineInput[],
  menu: readonly PriceableMenuItem[],
  serviceFee = 0,
) {
  if (requestedLines.length === 0) {
    throw new OrderPricingError(
      "EMPTY_ORDER",
      "An order must contain at least one item.",
    );
  }

  const menuById = new Map(menu.map((item) => [item.id, item]));
  const combinedQuantities = new Map<number, number>();

  for (const line of requestedLines) {
    const quantity = (combinedQuantities.get(line.menuItemId) ?? 0) + line.quantity;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 25) {
      throw new OrderPricingError(
        "INVALID_QUANTITY",
        "The combined quantity for an item must be between 1 and 25.",
        line.menuItemId,
      );
    }
    combinedQuantities.set(line.menuItemId, quantity);
  }

  const items: PricedOrderLine[] = [];
  for (const [menuItemId, quantity] of combinedQuantities) {
    const item = menuById.get(menuItemId);
    if (!item) {
      throw new OrderPricingError(
        "MENU_ITEM_NOT_FOUND",
        `Menu item ${menuItemId} does not exist.`,
        menuItemId,
      );
    }
    if (!item.isAvailable) {
      throw new OrderPricingError(
        "MENU_ITEM_UNAVAILABLE",
        `${item.name} is currently unavailable.`,
        menuItemId,
      );
    }

    items.push({
      menuItemId: item.id,
      name: item.name,
      unitPrice: item.price,
      quantity,
      total: item.price * quantity,
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  return {
    items,
    subtotal,
    serviceFee,
    total: subtotal + serviceFee,
  };
}
