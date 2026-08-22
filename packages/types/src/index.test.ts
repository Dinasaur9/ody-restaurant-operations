import { describe, expect, it } from "vitest";
import { canTransitionOrder, VALID_ORDER_TRANSITIONS } from ".";

describe("order lifecycle", () => {
  it("allows the expected kitchen workflow", () => {
    expect(canTransitionOrder("pending", "accepted")).toBe(true);
    expect(canTransitionOrder("accepted", "preparing")).toBe(true);
    expect(canTransitionOrder("preparing", "ready")).toBe(true);
    expect(canTransitionOrder("ready", "completed")).toBe(true);
  });

  it("prevents skipping workflow stages", () => {
    expect(canTransitionOrder("pending", "completed")).toBe(false);
    expect(canTransitionOrder("completed", "pending")).toBe(false);
  });

  it("only permits cancellation before preparation begins", () => {
    expect(VALID_ORDER_TRANSITIONS.pending).toContain("cancelled");
    expect(VALID_ORDER_TRANSITIONS.accepted).toContain("cancelled");
    expect(VALID_ORDER_TRANSITIONS.preparing).not.toContain("cancelled");
  });
});
