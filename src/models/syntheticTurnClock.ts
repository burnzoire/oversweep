export type ModelResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: string; message: string } };

export interface SyntheticTurnClockInput {
  angleDeg: number;
  rateDegPerSecond: number;
}

export interface SyntheticTurnClockAssessment
  extends SyntheticTurnClockInput {
  estimateSeconds: number;
  expectedSeconds: number;
  absoluteErrorSeconds: number;
  passed: boolean;
  feedback: string;
}

const failure = (code: string, message: string): ModelResult<never> => ({
  ok: false,
  error: { code, message },
});

export function calculateSyntheticTurnTime({
  angleDeg,
  rateDegPerSecond,
}: SyntheticTurnClockInput): ModelResult<number> {
  if (!Number.isFinite(angleDeg) || !Number.isFinite(rateDegPerSecond)) {
    return failure("non-finite-input", "Inputs must be finite numbers.");
  }
  if (angleDeg < 0 || angleDeg > 360) {
    return failure("angle-out-of-range", "Angle must be between 0° and 360°.");
  }
  if (rateDegPerSecond <= 0) {
    return failure("rate-not-positive", "Rate must be greater than 0°/s.");
  }

  const seconds = angleDeg / rateDegPerSecond;
  if (!Number.isFinite(seconds)) {
    return failure("result-out-of-range", "The calculated time is not finite.");
  }
  return { ok: true, value: seconds };
}

export function assessSyntheticTurnTime(
  input: SyntheticTurnClockInput & { estimateSeconds: number },
): ModelResult<SyntheticTurnClockAssessment> {
  if (!Number.isFinite(input.estimateSeconds) || input.estimateSeconds < 0) {
    return failure(
      "invalid-estimate",
      "Estimate must be a finite, non-negative number of seconds.",
    );
  }

  const calculation = calculateSyntheticTurnTime(input);
  if (!calculation.ok) return calculation;

  const absoluteErrorSeconds = Math.abs(
    input.estimateSeconds - calculation.value,
  );
  const roundingAllowance =
    Number.EPSILON *
    Math.max(1, Math.abs(input.estimateSeconds), calculation.value);
  const passed = absoluteErrorSeconds <= 0.001 + roundingAllowance;
  return {
    ok: true,
    value: {
      ...input,
      expectedSeconds: calculation.value,
      absoluteErrorSeconds,
      passed,
      feedback: passed
        ? "Your arithmetic matches the synthetic constant-rate example."
        : "Recheck the arithmetic: elapsed seconds equal swept degrees divided by degrees per second.",
    },
  };
}
