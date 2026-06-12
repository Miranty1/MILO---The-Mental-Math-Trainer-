import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getBestTime, recordTime } from './storage';

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('getBestTime', () => {
  it('returns null when no best is stored', () => {
    expect(getBestTime('mixed', 'easy')).toBeNull();
  });

  it('returns null for corrupted values', () => {
    localStorage.setItem('milo:best:mixed:easy', 'garbage');
    expect(getBestTime('mixed', 'easy')).toBeNull();
  });

  it('returns null when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('unavailable');
    });
    expect(getBestTime('mixed', 'easy')).toBeNull();
  });
});

describe('recordTime', () => {
  it('first run is a new best with no previous', () => {
    expect(recordTime('mixed', 'easy', 90_000)).toEqual({ isNewBest: true, previousBest: null });
    expect(getBestTime('mixed', 'easy')).toBe(90_000);
  });

  it('faster run replaces the best', () => {
    recordTime('mixed', 'easy', 90_000);
    expect(recordTime('mixed', 'easy', 80_000)).toEqual({ isNewBest: true, previousBest: 90_000 });
    expect(getBestTime('mixed', 'easy')).toBe(80_000);
  });

  it('slower run does not replace the best', () => {
    recordTime('mixed', 'easy', 80_000);
    expect(recordTime('mixed', 'easy', 90_000)).toEqual({ isNewBest: false, previousBest: 80_000 });
    expect(getBestTime('mixed', 'easy')).toBe(80_000);
  });

  it('keys are independent per mode and difficulty', () => {
    recordTime('mixed', 'easy', 80_000);
    expect(getBestTime('mixed', 'hard')).toBeNull();
    expect(getBestTime('addition', 'easy')).toBeNull();
  });

  it('does not throw when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('unavailable');
    });
    expect(recordTime('mixed', 'easy', 80_000)).toEqual({ isNewBest: true, previousBest: null });
  });
});
