import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useGame } from './useGame';

const questions = [
  { prompt: '2 + 3', answer: 5 },
  { prompt: '6 × 2', answer: 12 },
];

describe('useGame', () => {
  it('advances the moment input matches the answer', () => {
    const onFinish = vi.fn();
    const { result } = renderHook(() => useGame(questions, onFinish));
    act(() => result.current.pressDigit('5'));
    expect(result.current.index).toBe(1);
    expect(result.current.input).toBe('');
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('does not advance on wrong input', () => {
    const onFinish = vi.fn();
    const { result } = renderHook(() => useGame(questions, onFinish));
    act(() => result.current.pressDigit('4'));
    expect(result.current.index).toBe(0);
    expect(result.current.input).toBe('4');
  });

  it('multi-digit answers advance only on the full match', () => {
    const onFinish = vi.fn();
    const { result } = renderHook(() => useGame(questions, onFinish));
    act(() => result.current.pressDigit('5'));
    act(() => result.current.pressDigit('1'));
    expect(result.current.index).toBe(1);
    expect(result.current.input).toBe('1');
    act(() => result.current.pressDigit('2'));
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onFinish.mock.calls[0][0]).toBeGreaterThanOrEqual(0);
  });

  it('backspace removes the last digit, clear removes all', () => {
    const onFinish = vi.fn();
    const { result } = renderHook(() => useGame(questions, onFinish));
    act(() => result.current.pressDigit('4'));
    act(() => result.current.pressDigit('4'));
    act(() => result.current.backspace());
    expect(result.current.input).toBe('4');
    act(() => result.current.pressDigit('4'));
    act(() => result.current.clear());
    expect(result.current.input).toBe('');
  });

  it('ignores digits beyond 4 characters', () => {
    const onFinish = vi.fn();
    const { result } = renderHook(() => useGame(questions, onFinish));
    for (const d of ['9', '9', '9', '9', '9']) {
      act(() => result.current.pressDigit(d));
    }
    expect(result.current.input).toBe('9999');
  });
});
