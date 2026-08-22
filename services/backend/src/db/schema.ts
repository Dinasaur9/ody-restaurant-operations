import { relations } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { ORDER_CHANNELS, ORDER_STATUSES } from "@ody/types";

export const orderStatusEnum = pgEnum("order_status", ORDER_STATUSES);
export const orderChannelEnum = pgEnum("order_channel", ORDER_CHANNELS);

export const menuCategories = pgTable(
  "menu_categories",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    position: integer("position").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("menu_categories_name_unique").on(table.name),
    index("menu_categories_position_idx").on(table.position),
  ],
);

export const menuItems = pgTable(
  "menu_items",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => menuCategories.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    price: integer("price").notNull(),
    prepMinutes: integer("prep_minutes").notNull().default(10),
    isAvailable: boolean("is_available").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("menu_items_category_idx").on(table.categoryId),
    check("menu_items_price_positive", sql`${table.price} > 0`),
    check(
      "menu_items_prep_minutes_range",
      sql`${table.prepMinutes} between 1 and 120`,
    ),
  ],
);

export const customers = pgTable(
  "customers",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("customers_email_unique").on(table.email)],
);

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    displayId: text("display_id").notNull(),
    customerId: integer("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    customerName: text("customer_name").notNull(),
    channel: orderChannelEnum("channel").notNull(),
    status: orderStatusEnum("status").notNull().default("pending"),
    subtotal: integer("subtotal").notNull(),
    serviceFee: integer("service_fee").notNull().default(0),
    total: integer("total").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("orders_display_id_unique").on(table.displayId),
    index("orders_status_created_at_idx").on(table.status, table.createdAt),
    index("orders_customer_idx").on(table.customerId),
    check("orders_subtotal_nonnegative", sql`${table.subtotal} >= 0`),
    check("orders_service_fee_nonnegative", sql`${table.serviceFee} >= 0`),
    check("orders_total_nonnegative", sql`${table.total} >= 0`),
    check(
      "orders_total_consistent",
      sql`${table.total} = ${table.subtotal} + ${table.serviceFee}`,
    ),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    menuItemId: integer("menu_item_id")
      .notNull()
      .references(() => menuItems.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
    total: integer("total").notNull(),
  },
  (table) => [
    index("order_items_order_idx").on(table.orderId),
    index("order_items_menu_item_idx").on(table.menuItemId),
    check("order_items_unit_price_positive", sql`${table.unitPrice} > 0`),
    check("order_items_quantity_range", sql`${table.quantity} between 1 and 25`),
    check(
      "order_items_total_consistent",
      sql`${table.total} = ${table.unitPrice} * ${table.quantity}`,
    ),
  ],
);

export const orderingSettings = pgTable("ordering_settings", {
  id: serial("id").primaryKey(),
  restaurantName: text("restaurant_name").notNull().default("Ody Kitchen"),
  prepTimeMinutes: integer("prep_time_minutes").notNull().default(20),
  autoAcceptOrders: boolean("auto_accept_orders").notNull().default(false),
  serviceEnabled: boolean("service_enabled").notNull().default(true),
  openingTime: text("opening_time").notNull().default("09:00"),
  closingTime: text("closing_time").notNull().default("22:00"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const menuCategoryRelations = relations(menuCategories, ({ many }) => ({
  items: many(menuItems),
}));

export const menuItemRelations = relations(menuItems, ({ one, many }) => ({
  category: one(menuCategories, {
    fields: [menuItems.categoryId],
    references: [menuCategories.id],
  }),
  orderItems: many(orderItems),
}));

export const customerRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const orderRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  items: many(orderItems),
}));

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }),
}));

const nameSchema = z.string().trim().min(2).max(100);
const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export const menuCategorySelectSchema = createSelectSchema(menuCategories);
export const menuCategoryInsertSchema = createInsertSchema(menuCategories, {
  name: nameSchema,
  description: z.string().trim().max(300).nullable().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const menuItemSelectSchema = createSelectSchema(menuItems);
export const menuItemInsertSchema = createInsertSchema(menuItems, {
  name: nameSchema,
  description: z.string().trim().max(500),
  price: z.number().int().positive().max(1_000_000),
  prepMinutes: z.number().int().min(1).max(120),
}).omit({ id: true, createdAt: true, updatedAt: true });
export const menuItemUpdateSchema = createUpdateSchema(menuItems, {
  name: nameSchema,
  description: z.string().trim().max(500),
  price: z.number().int().positive().max(1_000_000),
  prepMinutes: z.number().int().min(1).max(120),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const customerSelectSchema = createSelectSchema(customers);
export const orderSelectSchema = createSelectSchema(orders);
export const orderItemSelectSchema = createSelectSchema(orderItems);
export const orderingSettingsSelectSchema = createSelectSchema(orderingSettings);
export const orderingSettingsUpdateSchema = createUpdateSchema(orderingSettings, {
  restaurantName: nameSchema,
  prepTimeMinutes: z.number().int().min(5).max(120),
  openingTime: timeSchema,
  closingTime: timeSchema,
}).omit({ id: true, updatedAt: true });

export type MenuCategory = typeof menuCategories.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type OrderingSettings = typeof orderingSettings.$inferSelect;
