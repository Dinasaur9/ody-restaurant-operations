export const ORDER_STATUSES = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_CHANNELS = ["delivery", "pickup", "dine_in"] as const;

export type OrderChannel = (typeof ORDER_CHANNELS)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "New",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const CHANNEL_LABELS: Record<OrderChannel, string> = {
  delivery: "Delivery",
  pickup: "Pickup",
  dine_in: "Dine in",
};

export const VALID_ORDER_TRANSITIONS: Record<
  OrderStatus,
  readonly OrderStatus[]
> = {
  pending: ["accepted", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready"],
  ready: ["completed"],
  completed: [],
  cancelled: [],
};

export function canTransitionOrder(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
): boolean {
  return VALID_ORDER_TRANSITIONS[currentStatus].includes(nextStatus);
}
