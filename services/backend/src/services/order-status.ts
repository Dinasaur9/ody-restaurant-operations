import {
  STATUS_LABELS,
  VALID_ORDER_TRANSITIONS,
  canTransitionOrder,
  type OrderStatus,
} from "@ody/types";
import { ApiError } from "../http/errors";

export function assertOrderTransition(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
): void {
  if (canTransitionOrder(currentStatus, nextStatus)) return;

  const validTransitions = VALID_ORDER_TRANSITIONS[currentStatus];
  const availableMessage = validTransitions.length
    ? ` Valid actions: ${validTransitions.map((status) => STATUS_LABELS[status]).join(", ")}.`
    : " This order is in a terminal state.";

  throw new ApiError(
    409,
    "INVALID_ORDER_TRANSITION",
    `Cannot move an order from ${STATUS_LABELS[currentStatus]} to ${STATUS_LABELS[nextStatus]}.${availableMessage}`,
    { currentStatus, requestedStatus: nextStatus, validTransitions },
  );
}
