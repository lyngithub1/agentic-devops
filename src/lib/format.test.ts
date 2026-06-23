import { describe, it, expect } from "vitest";
import { formatCurrency, formatPct, clamp, scoreTone } from "./format";

describe("formatCurrency", () => {
  it("formats plain values", () => {
    expect(formatCurrency(950)).toBe("$950");
  });
  it("uses K and M suffixes", () => {
    expect(formatCurrency(1_500)).toBe("$1.5K");
    expect(formatCurrency(2_000)).toBe("$2K");
    expect(formatCurrency(2_000_000)).toBe("$2M");
    expect(formatCurrency(2_500_000)).toBe("$2.5M");
  });
});

describe("formatPct", () => {
  it("adds a sign and respects digits", () => {
    expect(formatPct(12)).toBe("+12%");
    expect(formatPct(-3.5, 1)).toBe("-3.5%");
    expect(formatPct(0)).toBe("0%");
  });
});

describe("clamp", () => {
  it("clamps to the default 0..100 range", () => {
    expect(clamp(150)).toBe(100);
    expect(clamp(-10)).toBe(0);
    expect(clamp(42)).toBe(42);
  });
});

describe("scoreTone", () => {
  it("maps scores to semantic tones", () => {
    expect(scoreTone(90)).toBe("success");
    expect(scoreTone(70)).toBe("primary");
    expect(scoreTone(55)).toBe("warning");
    expect(scoreTone(20)).toBe("destructive");
  });
});
