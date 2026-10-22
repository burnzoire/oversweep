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

function readInput(input: unknown): ModelResult<SyntheticTurnClockInput> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return failure("invalid-input", "Input must be an object.");
  }
  const { angleDeg, rateDegPerSecond } =
    input as Partial<SyntheticTurnClockInput>;
  if (
    typeof angleDeg !== "number" ||
    typeof rateDegPerSecond !== "number" ||
    !Number.isFinite(angleDeg) ||
    !Number.isFinite(rateDegPerSecond)
  ) {
    return failure("non-finite-input", "Inputs must be finite numbers.");
  }
  return { ok: true, value: { angleDeg, rateDegPerSecond } };
}

export function calculateSyntheticTurnTime(input: unknown): ModelResult<number> {
  const parsed = readInput(input);
  if (!parsed.ok) return parsed;
  const { angleDeg, rateDegPerSecond } = parsed.value;

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
  input: unknown,
): ModelResult<SyntheticTurnClockAssessment> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return failure("invalid-input", "Input must be an object.");
  }
  const estimateSeconds = (input as { estimateSeconds?: unknown })
    .estimateSeconds;
  if (
    typeof estimateSeconds !== "number" ||
    !Number.isFinite(estimateSeconds) ||
    estimateSeconds < 0
  ) {
    return failure(
      "invalid-estimate",
      "Estimate must be a finite, non-negative number of seconds.",
    );
  }

  const modelInput = readInput(input);
  if (!modelInput.ok) return modelInput;
  const calculation = calculateSyntheticTurnTime(modelInput.value);
  if (!calculation.ok) return calculation;

  const { angleDeg, rateDegPerSecond } = modelInput.value;
  const absoluteErrorSeconds = Math.abs(estimateSeconds - calculation.value);
  const roundingAllowance =
    Number.EPSILON *
    Math.max(1, Math.abs(estimateSeconds), calculation.value);
  const passed = absoluteErrorSeconds <= 0.001 + roundingAllowance;
  return {
    ok: true,
    value: {
      angleDeg,
      rateDegPerSecond,
      estimateSeconds,
      expectedSeconds: calculation.value,
      absoluteErrorSeconds,
      passed,
      feedback: passed
        ? "Your arithmetic matches the synthetic constant-rate example."
        : "Recheck the arithmetic: elapsed seconds equal swept degrees divided by degrees per second.",
    },
  };
}
