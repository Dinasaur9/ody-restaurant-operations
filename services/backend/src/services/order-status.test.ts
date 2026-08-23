import { describe, expect, it } from "vitest";
import { ApiError } from "../http/errors";
import { assertOrderTransition } from "./order-status";

describe("order status actions", () => {
  it.each([
    ["pending", "accepted"],
    ["accepted", "preparing"],
    ["preparing", "ready"],
    ["ready", "completed"],
    ["pending", "cancelled"],
    ["accepted", "cancelled"],
  ] as const)("allows %s to move to %s", (current, next) => {
    expect(() => assertOrderTransition(current, next)).not.toThrow();
  });

  it.each([
    ["pending", "completed"],
    ["preparing", "cancelled"],
    ["ready", "preparing"],
    ["completed", "pending"],
    ["cancelled", "accepted"],
    ["pending", "pending"],
  ] as const)("rejects %s to %s", (current, next) => {
    expect(() => assertOrderTransition(current, next)).toThrowError(
      expect.objectContaining<Partial<ApiError>>({
        status: 409,
        code: "INVALID_ORDER_TRANSITION",
      }),
    );
  });
});
