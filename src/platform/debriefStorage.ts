export const DEBRIEF_STORAGE_KEY = "oversweep.case-three.synthetic-debrief.v1";
const MAX_DEBRIEF_ENTRIES = 50;

export interface DebriefEntry {
  id: string;
  createdAt: string;
  angleDeg: number;
  rateDegPerSecond: number;
  estimateSeconds: number;
  expectedSeconds: number;
  passed: boolean;
}

export type DebriefStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export interface DebriefRead {
  available: boolean;
  entries: DebriefEntry[];
  issue?: string;
}

function isDebriefEntry(value: unknown): value is DebriefEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<DebriefEntry>;
  return (
    typeof entry.id === "string" &&
    entry.id.length > 0 &&
    typeof entry.createdAt === "string" &&
    Number.isFinite(Date.parse(entry.createdAt)) &&
    Number.isFinite(entry.angleDeg) &&
    Number(entry.angleDeg) >= 0 &&
    Number(entry.angleDeg) <= 360 &&
    Number.isFinite(entry.rateDegPerSecond) &&
    Number(entry.rateDegPerSecond) > 0 &&
    Number.isFinite(entry.estimateSeconds) &&
    Number(entry.estimateSeconds) >= 0 &&
    Number.isFinite(entry.expectedSeconds) &&
    Number(entry.expectedSeconds) >= 0 &&
    typeof entry.passed === "boolean"
  );
}

export function readDebrief(storage: DebriefStorage | null): DebriefRead {
  if (!storage) {
    return {
      available: false,
      entries: [],
      issue: "Browser storage is unavailable; this debrief will not persist.",
    };
  }

  try {
    const saved = storage.getItem(DEBRIEF_STORAGE_KEY);
    if (!saved) return { available: true, entries: [] };
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      return {
        available: true,
        entries: [],
        issue: "Saved debrief data could not be read.",
      };
    }
    return {
      available: true,
      entries: parsed.filter(isDebriefEntry).slice(-MAX_DEBRIEF_ENTRIES),
      ...(parsed.every(isDebriefEntry)
        ? {}
        : { issue: "Some saved debrief entries could not be read." }),
    };
  } catch {
    return {
      available: false,
      entries: [],
      issue: "Browser storage is unavailable; this debrief will not persist.",
    };
  }
}

export function saveDebrief(
  storage: DebriefStorage | null,
  entry: DebriefEntry,
): DebriefRead {
  const current = readDebrief(storage);
  if (!storage || !current.available) return current;
  try {
    const entries = [...current.entries, entry].slice(-MAX_DEBRIEF_ENTRIES);
    storage.setItem(DEBRIEF_STORAGE_KEY, JSON.stringify(entries));
    return { available: true, entries };
  } catch {
    return {
      available: false,
      entries: current.entries,
      issue: "Browser storage is unavailable; this debrief will not persist.",
    };
  }
}

export function clearDebrief(
  storage: DebriefStorage | null,
): DebriefRead {
  if (!storage) {
    return {
      available: false,
      entries: [],
      issue: "Browser storage is unavailable; saved debrief could not be cleared.",
    };
  }
  try {
    storage.removeItem(DEBRIEF_STORAGE_KEY);
    return { available: true, entries: [] };
  } catch {
    return {
      available: false,
      entries: [],
      issue: "Browser storage is unavailable; saved debrief could not be cleared.",
    };
  }
}
