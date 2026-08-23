import type { CustomerWithHistory, MenuItem } from "@ody/api-client";
import type { BadgeTone } from "@ody/ui";

export function getStatusTone(status: string): BadgeTone {
  if (status === "completed") return "success";
  if (status === "cancelled") return "danger";
  if (status === "pending") return "warning";
  return "primary";
}

export function filterCustomers(
  customers: readonly CustomerWithHistory[],
  search: string,
): CustomerWithHistory[] {
  const query = search.trim().toLocaleLowerCase();
  if (!query) return [...customers];

  return customers.filter((customer) =>
    [customer.name, customer.email, customer.phone ?? ""]
      .join(" ")
      .toLocaleLowerCase()
      .includes(query),
  );
}

export function filterMenuItems(
  items: readonly MenuItem[],
  search: string,
): MenuItem[] {
  const query = search.trim().toLocaleLowerCase();
  if (!query) return [...items];

  return items.filter((item) => item.name.toLocaleLowerCase().includes(query));
}

export function calculateOrderEstimate(
  menu: readonly MenuItem[],
  quantities: Readonly<Record<number, number>>,
): number {
  return menu
    .filter((item) => item.isAvailable)
    .reduce(
      (sum, item) => sum + item.price * Math.max(0, quantities[item.id] ?? 0),
      0,
    );
}
