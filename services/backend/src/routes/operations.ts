import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { desc, eq, ne, sql } from "drizzle-orm";
import type { AppBindings } from "../app";
import {
  customers,
  customerSelectSchema,
  orderItems,
  orderingSettings,
  orderingSettingsSelectSchema,
  orderingSettingsUpdateSchema,
  orders,
  orderSelectSchema,
} from "../db/schema";
import { ApiError } from "../http/errors";
import { ApiErrorSchema, jsonResponse } from "../http/schemas";

const OrderPreviewSchema = orderSelectSchema
  .pick({
    id: true,
    displayId: true,
    customerName: true,
    channel: true,
    status: true,
    total: true,
  })
  .extend({ createdAt: z.string().datetime() })
  .openapi("OrderPreview");

const CustomerResponseSchema = customerSelectSchema
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    orderCount: z.number().int().nonnegative(),
    totalSpend: z.number().int().nonnegative(),
    averageOrder: z.number().int().nonnegative(),
    lastOrderAt: z.string().datetime().nullable(),
    recentOrders: z.array(OrderPreviewSchema),
  })
  .openapi("CustomerWithHistory");

const SettingsResponseSchema = orderingSettingsSelectSchema
  .omit({ updatedAt: true })
  .extend({ updatedAt: z.string().datetime() })
  .openapi("OrderingSettings");

const DashboardSummarySchema = z
  .object({
    revenue: z.number().int().nonnegative(),
    totalOrders: z.number().int().nonnegative(),
    activeOrders: z.number().int().nonnegative(),
    pendingOrders: z.number().int().nonnegative(),
    averageOrder: z.number().int().nonnegative(),
    customers: z.number().int().nonnegative(),
    popularItems: z.array(
      z.object({
        name: z.string(),
        quantity: z.number().int().nonnegative(),
        revenue: z.number().int().nonnegative(),
      }),
    ),
    recentOrders: z.array(OrderPreviewSchema),
  })
  .openapi("DashboardSummary");

const listCustomersRoute = createRoute({
  method: "get",
  path: "/api/customers",
  operationId: "getCustomers",
  summary: "List customers with order value and history",
  tags: ["CRM"],
  responses: {
    200: jsonResponse(z.array(CustomerResponseSchema)),
  },
});

const getSettingsRoute = createRoute({
  method: "get",
  path: "/api/settings",
  operationId: "getOrderingSettings",
  summary: "Get ordering settings",
  tags: ["Settings"],
  responses: {
    200: jsonResponse(SettingsResponseSchema),
    404: jsonResponse(ApiErrorSchema, "Settings not configured"),
  },
});

const updateSettingsRoute = createRoute({
  method: "patch",
  path: "/api/settings",
  operationId: "updateOrderingSettings",
  summary: "Update ordering settings",
  tags: ["Settings"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: orderingSettingsUpdateSchema.openapi("UpdateOrderingSettings"),
        },
      },
      required: true,
    },
  },
  responses: {
    200: jsonResponse(SettingsResponseSchema),
    404: jsonResponse(ApiErrorSchema, "Settings not configured"),
    422: jsonResponse(ApiErrorSchema, "Invalid service window"),
  },
});

const getSummaryRoute = createRoute({
  method: "get",
  path: "/api/summary",
  operationId: "getDashboardSummary",
  summary: "Get restaurant performance and live operations summary",
  tags: ["Dashboard"],
  responses: {
    200: jsonResponse(DashboardSummarySchema),
  },
});

const serializeOrderPreview = (order: typeof orders.$inferSelect) => ({
  id: order.id,
  displayId: order.displayId,
  customerName: order.customerName,
  channel: order.channel,
  status: order.status,
  total: order.total,
  createdAt: order.createdAt.toISOString(),
});

const timeToMinutes = (value: string) => {
  const [hours = 0, minutes = 0] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

export function registerOperationsRoutes(app: OpenAPIHono<AppBindings>) {
  app.openapi(listCustomersRoute, async (context) => {
    const db = context.get("db");
    const [customerRows, orderRows] = await Promise.all([
      db.select().from(customers).orderBy(desc(customers.createdAt)),
      db.select().from(orders).orderBy(desc(orders.createdAt)),
    ]);

    return context.json(
      customerRows.map((customer) => {
        const history = orderRows.filter(
          (order) => order.customerId === customer.id,
        );
        const revenueOrders = history.filter(
          (order) => order.status !== "cancelled",
        );
        const totalSpend = revenueOrders.reduce(
          (sum, order) => sum + order.total,
          0,
        );
        return {
          ...customer,
          createdAt: customer.createdAt.toISOString(),
          updatedAt: customer.updatedAt.toISOString(),
          orderCount: revenueOrders.length,
          totalSpend,
          averageOrder: revenueOrders.length
            ? Math.round(totalSpend / revenueOrders.length)
            : 0,
          lastOrderAt: history[0]?.createdAt.toISOString() ?? null,
          recentOrders: history.slice(0, 3).map(serializeOrderPreview),
        };
      }),
      200,
    );
  });

  app.openapi(getSettingsRoute, async (context) => {
    const db = context.get("db");
    const [settings] = await db.select().from(orderingSettings).limit(1);
    if (!settings) {
      throw new ApiError(
        404,
        "SETTINGS_NOT_FOUND",
        "Ordering settings have not been configured.",
      );
    }
    return context.json(
      { ...settings, updatedAt: settings.updatedAt.toISOString() },
      200,
    );
  });

  app.openapi(updateSettingsRoute, async (context) => {
    const db = context.get("db");
    const body = context.req.valid("json");
    const [current] = await db.select().from(orderingSettings).limit(1);
    if (!current) {
      throw new ApiError(
        404,
        "SETTINGS_NOT_FOUND",
        "Ordering settings have not been configured.",
      );
    }

    const openingTime = body.openingTime ?? current.openingTime;
    const closingTime = body.closingTime ?? current.closingTime;
    if (timeToMinutes(openingTime) >= timeToMinutes(closingTime)) {
      throw new ApiError(
        422,
        "INVALID_SERVICE_WINDOW",
        "Closing time must be later than opening time.",
        { openingTime, closingTime },
      );
    }

    const [updated] = await db
      .update(orderingSettings)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(orderingSettings.id, current.id))
      .returning();
    if (!updated) {
      throw new ApiError(500, "UPDATE_FAILED", "Settings could not be updated.");
    }

    return context.json(
      { ...updated, updatedAt: updated.updatedAt.toISOString() },
      200,
    );
  });

  app.openapi(getSummaryRoute, async (context) => {
    const db = context.get("db");
    const [stats] = await db
      .select({
        revenue:
          sql<number>`coalesce(sum(case when ${orders.status} != 'cancelled' then ${orders.total} else 0 end), 0)`.mapWith(
            Number,
          ),
        totalOrders: sql<number>`count(*)`.mapWith(Number),
        revenueOrderCount:
          sql<number>`count(*) filter (where ${orders.status} != 'cancelled')`.mapWith(
            Number,
          ),
        activeOrders:
          sql<number>`count(*) filter (where ${orders.status} in ('pending', 'accepted', 'preparing', 'ready'))`.mapWith(
            Number,
          ),
        pendingOrders:
          sql<number>`count(*) filter (where ${orders.status} = 'pending')`.mapWith(
            Number,
          ),
      })
      .from(orders);

    const [customerCount] = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(customers);

    const popularItems = await db
      .select({
        name: orderItems.name,
        quantity: sql<number>`sum(${orderItems.quantity})`.mapWith(Number),
        revenue: sql<number>`sum(${orderItems.total})`.mapWith(Number),
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(ne(orders.status, "cancelled"))
      .groupBy(orderItems.name)
      .orderBy(desc(sql`sum(${orderItems.quantity})`))
      .limit(4);

    const recentOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(5);

    const revenue = stats?.revenue ?? 0;
    const totalOrders = stats?.totalOrders ?? 0;
    const revenueOrderCount = stats?.revenueOrderCount ?? 0;
    return context.json(
      {
        revenue,
        totalOrders,
        activeOrders: stats?.activeOrders ?? 0,
        pendingOrders: stats?.pendingOrders ?? 0,
        averageOrder: revenueOrderCount
          ? Math.round(revenue / revenueOrderCount)
          : 0,
        customers: customerCount?.count ?? 0,
        popularItems,
        recentOrders: recentOrders.map(serializeOrderPreview),
      },
      200,
    );
  });
}
