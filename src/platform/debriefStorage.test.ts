import { describe, expect, it } from "vitest";
import {
  clearDebrief,
  DEBRIEF_STORAGE_KEY,
  readDebrief,
  saveDebrief,
  type DebriefStorage,
} from "./debriefStorage";

function memoryStorage(): DebriefStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, value),
    removeItem: (key) => void values.delete(key),
  };
}

const entry = {
  id: "run-1",
  createdAt: "2026-10-22T12:00:00.000Z",
  angleDeg: 90,
  rateDegPerSecond: 3,
  estimateSeconds: 30,
  expectedSeconds: 30,
  passed: true,
};

describe("local debrief storage", () => {
  it("persists and reloads valid debrief entries", () => {
    const storage = memoryStorage();
    expect(saveDebrief(storage, entry).entries).toEqual([entry]);
    expect(readDebrief(storage).entries).toEqual([entry]);
  });

  it("fails gracefully when storage is absent or throws", () => {
    expect(readDebrief(null)).toMatchObject({
      available: false,
      entries: [],
    });
    const throwing: DebriefStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    expect(readDebrief(throwing).available).toBe(false);
    expect(saveDebrief(throwing, entry).available).toBe(false);
    expect(clearDebrief(throwing).available).toBe(false);
  });

  it("ignores corrupt entries and keeps only the newest 50", () => {
    const storage = memoryStorage();
    storage.setItem(
      DEBRIEF_STORAGE_KEY,
      JSON.stringify([entry, { unexpected: true }]),
    );
    expect(readDebrief(storage)).toMatchObject({
      entries: [entry],
      issue: "Some saved debrief entries could not be read.",
    });

    let current = { available: true, entries: [] as typeof entry[] };
    for (let index = 0; index < 51; index += 1) {
      current = saveDebrief(storage, { ...entry, id: `run-${index}` });
    }
    expect(current.entries).toHaveLength(50);
    expect(current.entries[0]?.id).toBe("run-1");
  });

  it("clears the saved history", () => {
    const storage = memoryStorage();
    saveDebrief(storage, entry);
    expect(clearDebrief(storage)).toEqual({ available: true, entries: [] });
    expect(readDebrief(storage).entries).toEqual([]);
  });
});
