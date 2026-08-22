CREATE TYPE "public"."order_status" AS ENUM(
  'pending',
  'accepted',
  'preparing',
  'ready',
  'completed',
  'cancelled'
);

CREATE TYPE "public"."order_channel" AS ENUM(
  'delivery',
  'pickup',
  'dine_in'
);

CREATE TABLE "menu_categories" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "position" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "menu_categories_name_unique" UNIQUE("name")
);

CREATE TABLE "menu_items" (
  "id" serial PRIMARY KEY NOT NULL,
  "category_id" integer NOT NULL,
  "name" text NOT NULL,
  "description" text DEFAULT '' NOT NULL,
  "price" integer NOT NULL,
  "prep_minutes" integer DEFAULT 10 NOT NULL,
  "is_available" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "menu_items_price_positive" CHECK ("menu_items"."price" > 0),
  CONSTRAINT "menu_items_prep_minutes_range" CHECK ("menu_items"."prep_minutes" between 1 and 120)
);

CREATE TABLE "customers" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "customers_email_unique" UNIQUE("email")
);

CREATE TABLE "orders" (
  "id" serial PRIMARY KEY NOT NULL,
  "display_id" text NOT NULL,
  "customer_id" integer,
  "customer_name" text NOT NULL,
  "channel" "order_channel" NOT NULL,
  "status" "order_status" DEFAULT 'pending' NOT NULL,
  "subtotal" integer NOT NULL,
  "service_fee" integer DEFAULT 0 NOT NULL,
  "total" integer NOT NULL,
  "note" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "orders_display_id_unique" UNIQUE("display_id"),
  CONSTRAINT "orders_subtotal_nonnegative" CHECK ("orders"."subtotal" >= 0),
  CONSTRAINT "orders_service_fee_nonnegative" CHECK ("orders"."service_fee" >= 0),
  CONSTRAINT "orders_total_nonnegative" CHECK ("orders"."total" >= 0),
  CONSTRAINT "orders_total_consistent" CHECK ("orders"."total" = "orders"."subtotal" + "orders"."service_fee")
);

CREATE TABLE "order_items" (
  "id" serial PRIMARY KEY NOT NULL,
  "order_id" integer NOT NULL,
  "menu_item_id" integer NOT NULL,
  "name" text NOT NULL,
  "unit_price" integer NOT NULL,
  "quantity" integer NOT NULL,
  "total" integer NOT NULL,
  CONSTRAINT "order_items_unit_price_positive" CHECK ("order_items"."unit_price" > 0),
  CONSTRAINT "order_items_quantity_range" CHECK ("order_items"."quantity" between 1 and 25),
  CONSTRAINT "order_items_total_consistent" CHECK ("order_items"."total" = "order_items"."unit_price" * "order_items"."quantity")
);

CREATE TABLE "ordering_settings" (
  "id" serial PRIMARY KEY NOT NULL,
  "restaurant_name" text DEFAULT 'Ody Kitchen' NOT NULL,
  "prep_time_minutes" integer DEFAULT 20 NOT NULL,
  "auto_accept_orders" boolean DEFAULT false NOT NULL,
  "service_enabled" boolean DEFAULT true NOT NULL,
  "opening_time" text DEFAULT '09:00' NOT NULL,
  "closing_time" text DEFAULT '22:00' NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "menu_items"
  ADD CONSTRAINT "menu_items_category_id_menu_categories_id_fk"
  FOREIGN KEY ("category_id") REFERENCES "public"."menu_categories"("id")
  ON DELETE restrict;

ALTER TABLE "orders"
  ADD CONSTRAINT "orders_customer_id_customers_id_fk"
  FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id")
  ON DELETE set null;

ALTER TABLE "order_items"
  ADD CONSTRAINT "order_items_order_id_orders_id_fk"
  FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id")
  ON DELETE cascade;

ALTER TABLE "order_items"
  ADD CONSTRAINT "order_items_menu_item_id_menu_items_id_fk"
  FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id")
  ON DELETE restrict;

CREATE INDEX "menu_categories_position_idx" ON "menu_categories" ("position");
CREATE INDEX "menu_items_category_idx" ON "menu_items" ("category_id");
CREATE INDEX "orders_status_created_at_idx" ON "orders" ("status", "created_at");
CREATE INDEX "orders_customer_idx" ON "orders" ("customer_id");
CREATE INDEX "order_items_order_idx" ON "order_items" ("order_id");
CREATE INDEX "order_items_menu_item_idx" ON "order_items" ("menu_item_id");
