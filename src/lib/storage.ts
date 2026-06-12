import type { Difficulty, Mode } from './questions';

export interface RunRecord {
  isNewBest: boolean;
  previousBest: number | null;
}

function storageKey(mode: Mode, difficulty: Difficulty): string {
  return `milo:best:${mode}:${difficulty}`;
}

export function getBestTime(mode: Mode, difficulty: Difficulty): number | null {
  try {
    const raw = localStorage.getItem(storageKey(mode, difficulty));
    if (raw === null) return null;
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

export function recordTime(mode: Mode, difficulty: Difficulty, timeMs: number): RunRecord {
  const previousBest = getBestTime(mode, difficulty);
  const isNewBest = previousBest === null || timeMs < previousBest;
  if (isNewBest) {
    try {
      localStorage.setItem(storageKey(mode, difficulty), String(timeMs));
    } catch {
      // storage unavailable — the run still counts, it just won't persist
    }
  }
  return { isNewBest, previousBest };
}
