import { describe, expect, it } from "vitest";
import { clamp, formatCurrency, formatRelativeTime, getInitials } from ".";

describe("shared utilities", () => {
  it("formats cents as currency", () => {
    expect(formatCurrency(1290)).toContain("12.90");
  });

  it("formats recent timestamps relative to now", () => {
    const now = new Date("2026-08-22T12:00:00Z");
    expect(formatRelativeTime("2026-08-22T11:45:00Z", now)).toBe(
      "15 minutes ago",
    );
  });

  it("creates compact customer initials", () => {
    expect(getInitials("Maya Chen")).toBe("MC");
    expect(getInitials("Odyssey")).toBe("O");
  });

  it("clamps numbers to a safe range", () => {
    expect(clamp(4, 5, 10)).toBe(5);
    expect(clamp(11, 5, 10)).toBe(10);
  });
});
