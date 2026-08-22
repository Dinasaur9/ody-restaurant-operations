import { describe, expect, it } from "vitest";
import { colors, layout, spacing } from "./tokens";

describe("design tokens", () => {
  it("uses a consistent four-point spacing scale", () => {
    expect(Object.values(spacing).every((value) => value % 4 === 0)).toBe(true);
  });

  it("keeps interactive targets accessible", () => {
    expect(layout.minimumTouchTarget).toBeGreaterThanOrEqual(44);
  });

  it("provides every required semantic color", () => {
    expect(colors.success).toBeTruthy();
    expect(colors.warning).toBeTruthy();
    expect(colors.danger).toBeTruthy();
    expect(colors.info).toBeTruthy();
    expect(colors.disabled).toBeTruthy();
  });
});
