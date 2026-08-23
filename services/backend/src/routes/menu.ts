import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { asc, eq } from "drizzle-orm";
import type { AppBindings } from "../app";
import {
  menuCategories,
  menuCategoryInsertSchema,
  menuCategorySelectSchema,
  menuItems,
  menuItemInsertSchema,
  menuItemSelectSchema,
  menuItemUpdateSchema,
} from "../db/schema";
import { ApiError } from "../http/errors";
import { ApiErrorSchema, jsonResponse } from "../http/schemas";

const timestamps = {
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
};

const MenuItemResponseSchema = menuItemSelectSchema
  .omit({ createdAt: true, updatedAt: true })
  .extend(timestamps)
  .openapi("MenuItem");

const MenuCategoryResponseSchema = menuCategorySelectSchema
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    ...timestamps,
    items: z.array(MenuItemResponseSchema),
  })
  .openapi("MenuCategory");

const MenuCategoryCreateResponseSchema = menuCategorySelectSchema
  .omit({ createdAt: true, updatedAt: true })
  .extend(timestamps)
  .openapi("CreatedMenuCategory");

const idParameters = z.object({
  id: z.coerce.number().int().positive().openapi({
    param: { name: "id", in: "path" },
    example: 3,
  }),
});

const listMenuRoute = createRoute({
  method: "get",
  path: "/api/menu",
  operationId: "getMenu",
  summary: "List the categorized menu",
  tags: ["Menu"],
  responses: {
    200: jsonResponse(z.array(MenuCategoryResponseSchema)),
  },
});

const createCategoryRoute = createRoute({
  method: "post",
  path: "/api/menu/categories",
  operationId: "createMenuCategory",
  summary: "Create a menu category",
  tags: ["Menu"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: menuCategoryInsertSchema.openapi("CreateMenuCategory"),
        },
      },
      required: true,
    },
  },
  responses: {
    201: jsonResponse(MenuCategoryCreateResponseSchema, "Category created"),
    422: jsonResponse(ApiErrorSchema, "Invalid category data"),
  },
});

const createItemRoute = createRoute({
  method: "post",
  path: "/api/menu/items",
  operationId: "createMenuItem",
  summary: "Create a menu item",
  tags: ["Menu"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: menuItemInsertSchema.openapi("CreateMenuItem"),
        },
      },
      required: true,
    },
  },
  responses: {
    201: jsonResponse(MenuItemResponseSchema, "Menu item created"),
    404: jsonResponse(ApiErrorSchema, "Category not found"),
    422: jsonResponse(ApiErrorSchema, "Invalid menu item data"),
  },
});

const updateItemRoute = createRoute({
  method: "patch",
  path: "/api/menu/items/{id}",
  operationId: "updateMenuItem",
  summary: "Update a menu item",
  description:
    "Updates menu details or availability. This is the deliberate stock-control action used by the dashboard.",
  tags: ["Menu"],
  request: {
    params: idParameters,
    body: {
      content: {
        "application/json": {
          schema: menuItemUpdateSchema.openapi("UpdateMenuItem"),
        },
      },
      required: true,
    },
  },
  responses: {
    200: jsonResponse(MenuItemResponseSchema),
    404: jsonResponse(ApiErrorSchema, "Menu item or category not found"),
    422: jsonResponse(ApiErrorSchema, "Invalid menu item data"),
  },
});

const serializeMenuItem = (item: typeof menuItems.$inferSelect) => ({
  ...item,
  createdAt: item.createdAt.toISOString(),
  updatedAt: item.updatedAt.toISOString(),
});

export function registerMenuRoutes(app: OpenAPIHono<AppBindings>) {
  app.openapi(listMenuRoute, async (context) => {
    const db = context.get("db");
    const [categoryRows, itemRows] = await Promise.all([
      db
        .select()
        .from(menuCategories)
        .orderBy(asc(menuCategories.position), asc(menuCategories.id)),
      db.select().from(menuItems).orderBy(asc(menuItems.id)),
    ]);

    return context.json(
      categoryRows.map((category) => ({
        ...category,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
        items: itemRows
          .filter((item) => item.categoryId === category.id)
          .map(serializeMenuItem),
      })),
    );
  });

  app.openapi(createCategoryRoute, async (context) => {
    const db = context.get("db");
    const body = context.req.valid("json");

    const [created] = await db
      .insert(menuCategories)
      .values(body)
      .returning();
    if (!created) {
      throw new ApiError(500, "CREATE_FAILED", "The category could not be created.");
    }

    return context.json(
      {
        ...created,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
      201,
    );
  });

  app.openapi(createItemRoute, async (context) => {
    const db = context.get("db");
    const body = context.req.valid("json");
    const [category] = await db
      .select({ id: menuCategories.id })
      .from(menuCategories)
      .where(eq(menuCategories.id, body.categoryId))
      .limit(1);

    if (!category) {
      throw new ApiError(404, "CATEGORY_NOT_FOUND", "The selected category does not exist.");
    }

    const [created] = await db.insert(menuItems).values(body).returning();
    if (!created) {
      throw new ApiError(500, "CREATE_FAILED", "The menu item could not be created.");
    }

    return context.json(serializeMenuItem(created), 201);
  });

  app.openapi(updateItemRoute, async (context) => {
    const db = context.get("db");
    const { id } = context.req.valid("param");
    const body = context.req.valid("json");

    if (body.categoryId !== undefined) {
      const [category] = await db
        .select({ id: menuCategories.id })
        .from(menuCategories)
        .where(eq(menuCategories.id, body.categoryId))
        .limit(1);
      if (!category) {
        throw new ApiError(404, "CATEGORY_NOT_FOUND", "The selected category does not exist.");
      }
    }

    const [updated] = await db
      .update(menuItems)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(menuItems.id, id))
      .returning();

    if (!updated) {
      throw new ApiError(404, "MENU_ITEM_NOT_FOUND", "The menu item does not exist.");
    }

    return context.json(serializeMenuItem(updated), 200);
  });
}
