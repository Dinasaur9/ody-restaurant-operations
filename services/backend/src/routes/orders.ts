import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, desc, eq, ilike, inArray, or } from "drizzle-orm";
import {
  ORDER_CHANNELS,
  ORDER_STATUSES,
  VALID_ORDER_TRANSITIONS,
  type OrderStatus,
} from "@ody/types";
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
import { assertOrderTransition } from "../services/order-status";

const OrderItemResponseSchema = orderItemSelectSchema.openapi("OrderItem");

export const OrderResponseSchema = orderSelectSchema
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    items: z.array(OrderItemResponseSchema),
    availableActions: z.array(z.enum(ORDER_STATUSES)),
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

const orderIdParameters = z.object({
  id: z.coerce.number().int().positive().openapi({
    param: { name: "id", in: "path" },
    example: 42,
  }),
});

const listOrdersRoute = createRoute({
  method: "get",
  path: "/api/orders",
  operationId: "getOrders",
  summary: "List and filter orders",
  tags: ["Orders"],
  request: {
    query: z.object({
      status: z.enum(ORDER_STATUSES).optional(),
      channel: z.enum(ORDER_CHANNELS).optional(),
      search: z.string().trim().max(100).optional(),
    }),
  },
  responses: {
    200: jsonResponse(z.array(OrderResponseSchema)),
    422: jsonResponse(ApiErrorSchema, "Invalid filters"),
  },
});

const getOrderRoute = createRoute({
  method: "get",
  path: "/api/orders/{id}",
  operationId: "getOrder",
  summary: "Get complete order details",
  tags: ["Orders"],
  request: { params: orderIdParameters },
  responses: {
    200: jsonResponse(OrderResponseSchema),
    404: jsonResponse(ApiErrorSchema, "Order not found"),
  },
});

const updateOrderStatusRoute = createRoute({
  method: "patch",
  path: "/api/orders/{id}/status",
  operationId: "updateOrderStatus",
  summary: "Perform an order status action",
  description:
    "Moves an order through its explicit lifecycle. Arbitrary status assignment, skipped stages, reversals, and repeated transitions are rejected.",
  tags: ["Orders"],
  request: {
    params: orderIdParameters,
    body: {
      content: {
        "application/json": {
          schema: z
            .object({ status: z.enum(ORDER_STATUSES) })
            .openapi("UpdateOrderStatus"),
        },
      },
      required: true,
    },
  },
  responses: {
    200: jsonResponse(OrderResponseSchema),
    404: jsonResponse(ApiErrorSchema, "Order not found"),
    409: jsonResponse(ApiErrorSchema, "Invalid status transition"),
    422: jsonResponse(ApiErrorSchema, "Invalid status value"),
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
  availableActions: [...VALID_ORDER_TRANSITIONS[order.status]],
});

export function registerOrderRoutes(app: OpenAPIHono<AppBindings>) {
  app.openapi(listOrdersRoute, async (context) => {
    const db = context.get("db");
    const { status, channel, search } = context.req.valid("query");
    const conditions = [
      status ? eq(orders.status, status) : undefined,
      channel ? eq(orders.channel, channel) : undefined,
      search
        ? or(
            ilike(orders.displayId, `%${search}%`),
            ilike(orders.customerName, `%${search}%`),
          )
        : undefined,
    ].filter((condition) => condition !== undefined);

    const orderRows = await db
      .select()
      .from(orders)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(orders.createdAt));

    if (orderRows.length === 0) return context.json([], 200);

    const itemRows = await db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderRows.map((order) => order.id)));

    return context.json(
      orderRows.map((order) =>
        serializeOrder(
          order,
          itemRows.filter((item) => item.orderId === order.id),
        ),
      ),
      200,
    );
  });

  app.openapi(getOrderRoute, async (context) => {
    const db = context.get("db");
    const { id } = context.req.valid("param");
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) {
      throw new ApiError(404, "ORDER_NOT_FOUND", "The order does not exist.");
    }

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));
    return context.json(serializeOrder(order, items), 200);
  });

  app.openapi(updateOrderStatusRoute, async (context) => {
    const db = context.get("db");
    const { id } = context.req.valid("param");
    const { status } = context.req.valid("json");
    const [current] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!current) {
      throw new ApiError(404, "ORDER_NOT_FOUND", "The order does not exist.");
    }

    assertOrderTransition(current.status as OrderStatus, status);

    const [updated] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    if (!updated) {
      throw new ApiError(500, "UPDATE_FAILED", "The order could not be updated.");
    }

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));
    return context.json(serializeOrder(updated, items), 200);
  });

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
