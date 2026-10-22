import { useEffect, useState, type SubmitEvent } from "react";
import {
  assessSyntheticTurnTime,
  type SyntheticTurnClockAssessment,
} from "../models/syntheticTurnClock";
import {
  clearDebrief,
  readDebrief,
  saveDebrief,
  type DebriefEntry,
  type DebriefStorage,
} from "../platform/debriefStorage";

function browserStorage(): DebriefStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function formatTime(value: number): string {
  return `${value.toFixed(3)} s`;
}

export default function CaseThreePractice() {
  const [hydrated, setHydrated] = useState(false);
  const [angle, setAngle] = useState("90");
  const [rate, setRate] = useState("3");
  const [estimate, setEstimate] = useState("");
  const [assessment, setAssessment] =
    useState<SyntheticTurnClockAssessment | null>(null);
  const [feedback, setFeedback] = useState("");
  const [entries, setEntries] = useState<DebriefEntry[]>([]);
  const [storageIssue, setStorageIssue] = useState("");

  useEffect(() => {
    const result = readDebrief(browserStorage());
    setEntries(result.entries);
    setStorageIssue(result.issue ?? "");
    setHydrated(true);
  }, []);

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = assessSyntheticTurnTime({
      angleDeg: Number(angle),
      rateDegPerSecond: Number(rate),
      estimateSeconds: Number(estimate),
    });
    if (!result.ok) {
      setAssessment(null);
      setFeedback(result.error.message);
      return;
    }

    setAssessment(result.value);
    setFeedback(
      `${result.value.feedback} Expected arithmetic result: ${formatTime(result.value.expectedSeconds)}.`,
    );
    const entry: DebriefEntry = {
      id: `${Date.now()}-${entries.length}`,
      createdAt: new Date().toISOString(),
      angleDeg: result.value.angleDeg,
      rateDegPerSecond: result.value.rateDegPerSecond,
      estimateSeconds: result.value.estimateSeconds,
      expectedSeconds: result.value.expectedSeconds,
      passed: result.value.passed,
    };
    const saved = saveDebrief(browserStorage(), entry);
    setEntries(saved.entries);
    setStorageIssue(saved.issue ?? "");
  }

  function clearHistory() {
    const result = clearDebrief(browserStorage());
    setEntries(result.entries);
    setStorageIssue(result.issue ?? "");
  }

  return (
    <div className="practice" data-hydrated={hydrated}>
      <div className="notice notice--warning" role="note">
        <h2>Local synthetic exercise — not Case III guidance</h2>
        <p>
          The prototype export and its behavior have not been audited. This
          independent arithmetic example is not a Case III sequence, hold,
          marshal timeline, aircraft model, or operational timing reference.
          Do not use it for flight or simulator procedures.
        </p>
      </div>

      <section aria-labelledby="exercise-heading">
        <h2 id="exercise-heading">Constant-rate arithmetic example</h2>
        <p>
          For this synthetic example only, elapsed seconds equal swept degrees
          divided by a constant rate in degrees per second. The numbers do not
          represent aircraft performance or carrier procedures.
        </p>
        <p>
          <strong>Example relation:</strong> elapsed time = swept angle ÷
          constant angular rate.
        </p>

        <form className="practice__form" onSubmit={submit}>
          <label>
            Swept angle (degrees)
            <input
              type="number"
              min="0"
              max="360"
              step="any"
              value={angle}
              onChange={(event) => setAngle(event.target.value)}
              required
            />
          </label>
          <label>
            Constant rate (degrees per second)
            <input
              type="number"
              min="0"
              step="any"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
              required
            />
          </label>
          <label>
            Your estimated elapsed time (seconds)
            <input
              type="number"
              min="0"
              step="any"
              value={estimate}
              onChange={(event) => setEstimate(event.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={!hydrated}>
            Check arithmetic
          </button>
        </form>

        <p className="feedback" aria-live="polite" role="status">
          {feedback}
        </p>
        {assessment && (
          <dl className="result">
            <div>
              <dt>Arithmetic result</dt>
              <dd>{formatTime(assessment.expectedSeconds)}</dd>
            </div>
            <div>
              <dt>Difference from estimate</dt>
              <dd>{formatTime(assessment.absoluteErrorSeconds)}</dd>
            </div>
            <div>
              <dt>Result</dt>
              <dd>{assessment.passed ? "Matches within 0.001 s" : "Review"}</dd>
            </div>
          </dl>
        )}
      </section>

      <section aria-labelledby="debrief-heading" className="debrief">
        <div className="debrief__heading">
          <div>
            <h2 id="debrief-heading">Saved debrief</h2>
            <p>
              Runs are stored only in this browser. Speech is not used or
              required. Up to 50 entries are retained.
            </p>
          </div>
          {entries.length > 0 && (
            <button type="button" className="button--secondary" onClick={clearHistory}>
              Clear debrief
            </button>
          )}
        </div>
        {storageIssue && (
          <p className="feedback" role="status" aria-live="polite">
            {storageIssue}
          </p>
        )}
        {entries.length === 0 ? (
          <p>No practice runs saved yet.</p>
        ) : (
          <ol aria-label="Synthetic exercise debrief history">
            {[...entries].reverse().map((entry) => (
              <li key={entry.id}>
                <time dateTime={entry.createdAt}>
                  {new Date(entry.createdAt).toLocaleString()}
                </time>
                {" — "}
                {entry.angleDeg}° at {entry.rateDegPerSecond}°/s; estimate{" "}
                {formatTime(entry.estimateSeconds)}, arithmetic result{" "}
                {formatTime(entry.expectedSeconds)};{" "}
                {entry.passed ? "matches" : "review"}.
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
