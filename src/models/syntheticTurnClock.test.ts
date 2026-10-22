import { describe, expect, it } from "vitest";
import {
  assessSyntheticTurnTime,
  calculateSyntheticTurnTime,
} from "./syntheticTurnClock";

describe("synthetic constant-rate turn clock", () => {
  it.each([
    [0, 3, 0],
    [90, 3, 30],
    [180, 3, 60],
    [360, 3, 120],
  ])("calculates %i degrees at %i degrees per second", (angle, rate, time) => {
    expect(
      calculateSyntheticTurnTime({
        angleDeg: angle,
        rateDegPerSecond: rate,
      }),
    ).toEqual({ ok: true, value: time });
  });

  it("is deterministic for repeated inputs", () => {
    const input = { angleDeg: 180, rateDegPerSecond: 3 };
    expect(calculateSyntheticTurnTime(input)).toEqual(
      calculateSyntheticTurnTime(input),
    );
  });

  it.each([
    [null, "invalid-input"],
    ["invalid", "invalid-input"],
    [[], "invalid-input"],
    [{ angleDeg: "90", rateDegPerSecond: 3 }, "non-finite-input"],
    [{ angleDeg: 90 }, "non-finite-input"],
    [{ angleDeg: -1, rateDegPerSecond: 3 }, "angle-out-of-range"],
    [{ angleDeg: 361, rateDegPerSecond: 3 }, "angle-out-of-range"],
    [{ angleDeg: 90, rateDegPerSecond: 0 }, "rate-not-positive"],
    [{ angleDeg: 90, rateDegPerSecond: -1 }, "rate-not-positive"],
    [{ angleDeg: Number.NaN, rateDegPerSecond: 3 }, "non-finite-input"],
    [{ angleDeg: 90, rateDegPerSecond: Number.POSITIVE_INFINITY }, "non-finite-input"],
    [{ angleDeg: 360, rateDegPerSecond: Number.MIN_VALUE }, "result-out-of-range"],
  ])("rejects invalid model inputs %#", (input, code) => {
    expect(calculateSyntheticTurnTime(input)).toMatchObject({
      ok: false,
      error: { code },
    });
  });

  it("reports explanatory arithmetic feedback and the documented tolerance", () => {
    const boundary = assessSyntheticTurnTime({
      angleDeg: 90,
      rateDegPerSecond: 3,
      estimateSeconds: 30.001,
    });
    expect(boundary).toMatchObject({
      ok: true,
      value: { expectedSeconds: 30, passed: true },
    });
    if (boundary.ok) {
      expect(boundary.value.absoluteErrorSeconds).toBeCloseTo(0.001, 12);
    }
    expect(
      assessSyntheticTurnTime({
        angleDeg: 90,
        rateDegPerSecond: 3,
        estimateSeconds: 31,
      }),
    ).toMatchObject({
      ok: true,
      value: { passed: false, feedback: expect.stringContaining("Recheck") },
    });
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, -1])(
    "rejects invalid estimates (%s)",
    (estimateSeconds) => {
      expect(
        assessSyntheticTurnTime({
          angleDeg: 90,
          rateDegPerSecond: 3,
          estimateSeconds,
        }),
      ).toMatchObject({ ok: false, error: { code: "invalid-estimate" } });
    },
  );

  it("rejects missing assessment input", () => {
    expect(assessSyntheticTurnTime(null)).toMatchObject({
      ok: false,
      error: { code: "invalid-input" },
    });
  });
});
