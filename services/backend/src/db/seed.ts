import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import {
  customers,
  menuCategories,
  menuItems,
  orderItems,
  orderingSettings,
  orders,
} from "./schema";

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/ody";

const client = postgres(databaseUrl, { max: 1 });
const db = drizzle(client);

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000);

async function seed() {
  await db.transaction(async (tx) => {
    // Seed is deliberately repeatable for a fast reviewer bootstrap.
    await tx.delete(orderItems);
    await tx.delete(orders);
    await tx.delete(menuItems);
    await tx.delete(menuCategories);
    await tx.delete(customers);
    await tx.delete(orderingSettings);

    const categoryRows = await tx
      .insert(menuCategories)
      .values([
        {
          name: "Small plates",
          description: "Bright, seasonal plates made for sharing",
          position: 1,
        },
        {
          name: "Mains",
          description: "Kitchen favourites prepared to order",
          position: 2,
        },
        {
          name: "Desserts",
          description: "A sweet finish from the pastry counter",
          position: 3,
        },
        {
          name: "Drinks",
          description: "House-made refreshers and carefully sourced bottles",
          position: 4,
        },
      ])
      .returning();

    const [smallPlates, mains, desserts, drinks] = categoryRows;
    if (!smallPlates || !mains || !desserts || !drinks) {
      throw new Error("Failed to create seed categories");
    }

    const itemRows = await tx
      .insert(menuItems)
      .values([
        {
          categoryId: smallPlates.id,
          name: "Charred aubergine",
          description: "Tahini, pomegranate, mint and toasted sesame",
          price: 1050,
          prepMinutes: 8,
        },
        {
          categoryId: smallPlates.id,
          name: "Burrata & peaches",
          description: "Basil oil, sea salt and sourdough crumb",
          price: 1300,
          prepMinutes: 7,
        },
        {
          categoryId: mains.id,
          name: "Truffle rigatoni",
          description: "Wild mushrooms, pecorino and black pepper",
          price: 1850,
          prepMinutes: 16,
        },
        {
          categoryId: mains.id,
          name: "Miso glazed salmon",
          description: "Sesame greens, jasmine rice and spring onion",
          price: 2200,
          prepMinutes: 18,
        },
        {
          categoryId: mains.id,
          name: "Garden grain bowl",
          description: "Avocado, edamame, herbs and ginger dressing",
          price: 1550,
          prepMinutes: 10,
          isAvailable: false,
        },
        {
          categoryId: desserts.id,
          name: "Burnt honey cheesecake",
          description: "Crème fraîche and seasonal compote",
          price: 850,
          prepMinutes: 4,
        },
        {
          categoryId: drinks.id,
          name: "Yuzu lemonade",
          description: "Yuzu, lemon and sparkling water",
          price: 550,
          prepMinutes: 2,
        },
        {
          categoryId: drinks.id,
          name: "Cold brew tonic",
          description: "Single-origin cold brew, tonic and orange",
          price: 600,
          prepMinutes: 3,
        },
      ])
      .returning();

    const itemByName = new Map(itemRows.map((item) => [item.name, item]));

    const customerRows = await tx
      .insert(customers)
      .values([
        {
          name: "Maya Chen",
          email: "maya.chen@example.com",
          phone: "+33 6 14 22 91 08",
          createdAt: minutesAgo(45_000),
        },
        {
          name: "Thomas Bernard",
          email: "thomas.bernard@example.com",
          phone: "+33 6 55 18 42 77",
          createdAt: minutesAgo(31_000),
        },
        {
          name: "Lina Haddad",
          email: "lina.haddad@example.com",
          phone: "+33 7 20 44 12 39",
          createdAt: minutesAgo(22_000),
        },
        {
          name: "Noah Williams",
          email: "noah.williams@example.com",
          phone: "+33 6 80 91 23 02",
          createdAt: minutesAgo(8_000),
        },
        {
          name: "Sofia Rossi",
          email: "sofia.rossi@example.com",
          phone: "+33 7 44 31 76 20",
          createdAt: minutesAgo(2_000),
        },
      ])
      .returning();

    const customerByName = new Map(
      customerRows.map((customer) => [customer.name, customer]),
    );

    const orderSeeds = [
      {
        displayId: "OD-1052",
        customer: "Maya Chen",
        channel: "delivery" as const,
        status: "pending" as const,
        ageMinutes: 4,
        note: "Please ring the courtyard bell.",
        lines: [
          ["Truffle rigatoni", 2],
          ["Yuzu lemonade", 1],
        ] as const,
      },
      {
        displayId: "OD-1051",
        customer: "Thomas Bernard",
        channel: "pickup" as const,
        status: "accepted" as const,
        ageMinutes: 9,
        lines: [
          ["Miso glazed salmon", 1],
          ["Cold brew tonic", 1],
        ] as const,
      },
      {
        displayId: "OD-1050",
        customer: "Lina Haddad",
        channel: "dine_in" as const,
        status: "preparing" as const,
        ageMinutes: 16,
        note: "Table 8",
        lines: [
          ["Charred aubergine", 2],
          ["Burrata & peaches", 1],
          ["Truffle rigatoni", 1],
        ] as const,
      },
      {
        displayId: "OD-1049",
        customer: "Sofia Rossi",
        channel: "pickup" as const,
        status: "ready" as const,
        ageMinutes: 28,
        lines: [
          ["Miso glazed salmon", 2],
          ["Burnt honey cheesecake", 2],
        ] as const,
      },
      {
        displayId: "OD-1048",
        customer: "Maya Chen",
        channel: "delivery" as const,
        status: "completed" as const,
        ageMinutes: 84,
        lines: [
          ["Burrata & peaches", 1],
          ["Truffle rigatoni", 1],
          ["Yuzu lemonade", 2],
        ] as const,
      },
      {
        displayId: "OD-1047",
        customer: "Noah Williams",
        channel: "dine_in" as const,
        status: "completed" as const,
        ageMinutes: 190,
        note: "Table 3",
        lines: [
          ["Charred aubergine", 1],
          ["Miso glazed salmon", 2],
          ["Burnt honey cheesecake", 1],
        ] as const,
      },
      {
        displayId: "OD-1046",
        customer: "Thomas Bernard",
        channel: "pickup" as const,
        status: "cancelled" as const,
        ageMinutes: 420,
        note: "Cancelled before kitchen acceptance",
        lines: [["Truffle rigatoni", 1]] as const,
      },
      {
        displayId: "OD-1045",
        customer: "Maya Chen",
        channel: "delivery" as const,
        status: "completed" as const,
        ageMinutes: 1_560,
        lines: [
          ["Miso glazed salmon", 1],
          ["Yuzu lemonade", 1],
        ] as const,
      },
    ];

    for (const orderSeed of orderSeeds) {
      const customer = customerByName.get(orderSeed.customer);
      if (!customer) throw new Error(`Missing customer ${orderSeed.customer}`);

      const pricedLines = orderSeed.lines.map(([name, quantity]) => {
        const item = itemByName.get(name);
        if (!item) throw new Error(`Missing menu item ${name}`);
        return {
          item,
          quantity,
          total: item.price * quantity,
        };
      });
      const subtotal = pricedLines.reduce((sum, line) => sum + line.total, 0);
      const createdAt = minutesAgo(orderSeed.ageMinutes);

      const [order] = await tx
        .insert(orders)
        .values({
          displayId: orderSeed.displayId,
          customerId: customer.id,
          customerName: customer.name,
          channel: orderSeed.channel,
          status: orderSeed.status,
          subtotal,
          serviceFee: 0,
          total: subtotal,
          note: "note" in orderSeed ? orderSeed.note : null,
          createdAt,
          updatedAt: createdAt,
        })
        .returning();
      if (!order) throw new Error(`Failed to create ${orderSeed.displayId}`);

      await tx.insert(orderItems).values(
        pricedLines.map(({ item, quantity, total }) => ({
          orderId: order.id,
          menuItemId: item.id,
          name: item.name,
          unitPrice: item.price,
          quantity,
          total,
        })),
      );
    }

    await tx.insert(orderingSettings).values({
      id: 1,
      restaurantName: "Atelier Ody",
      prepTimeMinutes: 20,
      autoAcceptOrders: false,
      serviceEnabled: true,
      openingTime: "09:00",
      closingTime: "22:30",
    });
  });
}

try {
  await seed();
  console.log(
    "Seeded Atelier Ody: 4 categories, 8 menu items, 5 customers, 8 orders.",
  );
} finally {
  await client.end();
}
