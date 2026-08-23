import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { eq, inArray } from "drizzle-orm";
import type { AppBindings } from "../app";
import {
  customers,
  menuItems,
  orderInsertSchema,
  orderItemSelectSchema,
  orderItems,
  orderingSettings,
  orders,
  orderSelectSchema,
} from "../db/schema";
import { ApiError } from "../http/errors";
import { ApiErrorSchema, jsonResponse } from "../http/schemas";
import { OrderPricingError, priceOrder } from "../services/order-pricing";

const OrderItemResponseSchema = orderItemSelectSchema.openapi("OrderItem");

export const OrderResponseSchema = orderSelectSchema
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    items: z.array(OrderItemResponseSchema),
  })
  .openapi("Order");

const orderLineInputSchema = z.object({
  menuItemId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(25),
});

const createOrderBodySchema = orderInsertSchema
  .pick({ customerId: true, customerName: true, channel: true, note: true })
  .extend({
    customerId: z.number().int().positive().optional(),
    customerName: z.string().trim().min(2).max(100),
    note: z.string().trim().max(300).optional(),
    items: z.array(orderLineInputSchema).min(1).max(50),
  })
  .openapi("CreateOrder");

const createOrderRoute = createRoute({
  method: "post",
  path: "/api/orders",
  operationId: "createOrder",
  summary: "Create a server-priced order",
  description:
    "Accepts menu item identifiers and quantities. Names, prices, line totals, and order totals are always resolved and calculated by the server.",
  tags: ["Orders"],
  request: {
    body: {
      content: {
        "application/json": { schema: createOrderBodySchema },
      },
      required: true,
    },
  },
  responses: {
    201: jsonResponse(OrderResponseSchema, "Order created"),
    404: jsonResponse(ApiErrorSchema, "Customer or menu item not found"),
    409: jsonResponse(ApiErrorSchema, "Ordering disabled or item unavailable"),
    422: jsonResponse(ApiErrorSchema, "Invalid order data"),
  },
});

const serializeOrder = (
  order: typeof orders.$inferSelect,
  items: (typeof orderItems.$inferSelect)[],
) => ({
  ...order,
  createdAt: order.createdAt.toISOString(),
  updatedAt: order.updatedAt.toISOString(),
  items,
});

export function registerOrderRoutes(app: OpenAPIHono<AppBindings>) {
  app.openapi(createOrderRoute, async (context) => {
    const db = context.get("db");
    const body = context.req.valid("json");

    const [settings] = await db.select().from(orderingSettings).limit(1);
    if (!settings) {
      throw new ApiError(
        409,
        "SETTINGS_NOT_CONFIGURED",
        "Ordering settings must be configured before accepting orders.",
      );
    }
    if (!settings.serviceEnabled) {
      throw new ApiError(
        409,
        "ORDERING_DISABLED",
        "Online ordering is currently unavailable.",
      );
    }

    if (body.customerId !== undefined) {
      const [customer] = await db
        .select({ id: customers.id })
        .from(customers)
        .where(eq(customers.id, body.customerId))
        .limit(1);
      if (!customer) {
        throw new ApiError(
          404,
          "CUSTOMER_NOT_FOUND",
          "The selected customer does not exist.",
        );
      }
    }

    const requestedMenuItemIds = [
      ...new Set(body.items.map((item) => item.menuItemId)),
    ];
    const menu = await db
      .select({
        id: menuItems.id,
        name: menuItems.name,
        price: menuItems.price,
        isAvailable: menuItems.isAvailable,
      })
      .from(menuItems)
      .where(inArray(menuItems.id, requestedMenuItemIds));

    let pricedOrder: ReturnType<typeof priceOrder>;
    try {
      pricedOrder = priceOrder(body.items, menu);
    } catch (error) {
      if (!(error instanceof OrderPricingError)) throw error;

      const status =
        error.code === "MENU_ITEM_NOT_FOUND"
          ? 404
          : error.code === "MENU_ITEM_UNAVAILABLE"
            ? 409
            : 422;
      throw new ApiError(status, error.code, error.message, {
        menuItemId: error.menuItemId,
      });
    }

    const created = await db.transaction(async (tx) => {
      const now = new Date();
      const [order] = await tx
        .insert(orders)
        .values({
          displayId: `OD-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
          customerId: body.customerId,
          customerName: body.customerName,
          channel: body.channel,
          status: settings.autoAcceptOrders ? "accepted" : "pending",
          subtotal: pricedOrder.subtotal,
          serviceFee: pricedOrder.serviceFee,
          total: pricedOrder.total,
          note: body.note,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      if (!order) {
        throw new ApiError(500, "CREATE_FAILED", "The order could not be created.");
      }

      const items = await tx
        .insert(orderItems)
        .values(
          pricedOrder.items.map((item) => ({
            ...item,
            orderId: order.id,
          })),
        )
        .returning();

      return { order, items };
    });

    return context.json(serializeOrder(created.order, created.items), 201);
  });
}
