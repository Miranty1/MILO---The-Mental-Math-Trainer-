import { describe, expect, it } from 'vitest';
import { formatTime } from './format';

describe('formatTime', () => {
  it('formats sub-minute times as seconds with tenths', () => {
    expect(formatTime(0)).toBe('0.0s');
    expect(formatTime(5_340)).toBe('5.3s');
    expect(formatTime(59_999)).toBe('59.9s');
  });

  it('formats minute-plus times as m:ss.t', () => {
    expect(formatTime(60_000)).toBe('1:00.0');
    expect(formatTime(83_456)).toBe('1:23.4');
    expect(formatTime(605_000)).toBe('10:05.0');
  });
});
