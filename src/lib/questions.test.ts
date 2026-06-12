import { describe, expect, it } from 'vitest';
import { generateQuestion } from './questions';
import type { Question } from './questions';

const SAMPLES = 500;

function parse(q: Question): { a: number; op: string; b: number } {
  const [a, op, b] = q.prompt.split(' ');
  return { a: Number(a), op, b: Number(b) };
}

function digits(n: number): number {
  return String(n).length;
}

describe('addition', () => {
  it('easy: 1–20 + 1–20', () => {
    for (let i = 0; i < SAMPLES; i++) {
      const q = generateQuestion('addition', 'easy');
      const { a, op, b } = parse(q);
      expect(op).toBe('+');
      expect(a).toBeGreaterThanOrEqual(1);
      expect(a).toBeLessThanOrEqual(20);
      expect(b).toBeGreaterThanOrEqual(1);
      expect(b).toBeLessThanOrEqual(20);
      expect(q.answer).toBe(a + b);
    }
  });

  it('medium: 2-digit + 2-digit, no column ever carries', () => {
    for (let i = 0; i < SAMPLES; i++) {
      const q = generateQuestion('addition', 'medium');
      const { a, b } = parse(q);
      expect(digits(a)).toBe(2);
      expect(digits(b)).toBe(2);
      expect((a % 10) + (b % 10)).toBeLessThanOrEqual(9);
      expect(Math.floor(a / 10) + Math.floor(b / 10)).toBeLessThanOrEqual(9);
      expect(q.answer).toBe(a + b);
    }
  });

  it('hard: 2-digit + 2-digit with a units carry, or 3-digit + 2-digit', () => {
    let sawTwoDigit = false;
    let sawThreeDigit = false;
    for (let i = 0; i < SAMPLES; i++) {
      const q = generateQuestion('addition', 'hard');
      const { a, b } = parse(q);
      expect(digits(b)).toBe(2);
      if (digits(a) === 2) {
        sawTwoDigit = true;
        expect((a % 10) + (b % 10)).toBeGreaterThanOrEqual(10);
      } else {
        sawThreeDigit = true;
        expect(digits(a)).toBe(3);
      }
      expect(q.answer).toBe(a + b);
    }
    expect(sawTwoDigit).toBe(true);
    expect(sawThreeDigit).toBe(true);
  });
});

describe('subtraction', () => {
  it('easy: 1–20 − 1–20, never negative', () => {
    for (let i = 0; i < SAMPLES; i++) {
      const q = generateQuestion('subtraction', 'easy');
      const { a, op, b } = parse(q);
      expect(op).toBe('−');
      expect(a).toBeGreaterThanOrEqual(1);
      expect(a).toBeLessThanOrEqual(20);
      expect(b).toBeGreaterThanOrEqual(1);
      expect(b).toBeLessThanOrEqual(20);
      expect(q.answer).toBe(a - b);
      expect(q.answer).toBeGreaterThanOrEqual(0);
    }
  });

  it('medium: 2-digit − 2-digit, always borrows, positive answer', () => {
    for (let i = 0; i < SAMPLES; i++) {
      const q = generateQuestion('subtraction', 'medium');
      const { a, b } = parse(q);
      expect(digits(a)).toBe(2);
      expect(digits(b)).toBe(2);
      expect(a % 10).toBeLessThan(b % 10);
      expect(q.answer).toBe(a - b);
      expect(q.answer).toBeGreaterThan(0);
    }
  });

  it('hard: 3-digit − 2-digit, always borrows, positive answer', () => {
    for (let i = 0; i < SAMPLES; i++) {
      const q = generateQuestion('subtraction', 'hard');
      const { a, b } = parse(q);
      expect(digits(a)).toBe(3);
      expect(digits(b)).toBe(2);
      expect(a % 10).toBeLessThan(b % 10);
      expect(q.answer).toBe(a - b);
      expect(q.answer).toBeGreaterThan(0);
    }
  });
});

describe('multiplication', () => {
  it('easy: times tables 1–10', () => {
    for (let i = 0; i < SAMPLES; i++) {
      const q = generateQuestion('multiplication', 'easy');
      const { a, op, b } = parse(q);
      expect(op).toBe('×');
      expect(a).toBeGreaterThanOrEqual(1);
      expect(a).toBeLessThanOrEqual(10);
      expect(b).toBeGreaterThanOrEqual(1);
      expect(b).toBeLessThanOrEqual(10);
      expect(q.answer).toBe(a * b);
    }
  });

  it('medium: 1-digit × 2-digit, or teens × teens', () => {
    let sawOneDigit = false;
    let sawTeens = false;
    for (let i = 0; i < SAMPLES; i++) {
      const q = generateQuestion('multiplication', 'medium');
      const { a, b } = parse(q);
      if (digits(a) === 1) {
        sawOneDigit = true;
        expect(a).toBeGreaterThanOrEqual(2);
        expect(b).toBeGreaterThanOrEqual(10);
        expect(b).toBeLessThanOrEqual(99);
      } else {
        sawTeens = true;
        expect(a).toBeGreaterThanOrEqual(12);
        expect(a).toBeLessThanOrEqual(19);
        expect(b).toBeGreaterThanOrEqual(12);
        expect(b).toBeLessThanOrEqual(19);
      }
      expect(q.answer).toBe(a * b);
    }
    expect(sawOneDigit).toBe(true);
    expect(sawTeens).toBe(true);
  });

  it('hard: 2-digit × 2-digit', () => {
    for (let i = 0; i < SAMPLES; i++) {
      const q = generateQuestion('multiplication', 'hard');
      const { a, b } = parse(q);
      expect(digits(a)).toBe(2);
      expect(digits(b)).toBe(2);
      expect(q.answer).toBe(a * b);
    }
  });
});

describe('division', () => {
  it('easy: times-tables-based, exact', () => {
    for (let i = 0; i < SAMPLES; i++) {
      const q = generateQuestion('division', 'easy');
      const { a, op, b } = parse(q);
      expect(op).toBe('÷');
      expect(b).toBeGreaterThanOrEqual(2);
      expect(b).toBeLessThanOrEqual(10);
      expect(q.answer).toBeGreaterThanOrEqual(2);
      expect(q.answer).toBeLessThanOrEqual(10);
      expect(q.answer * b).toBe(a);
    }
  });

  it('medium: 2-digit ÷ 1-digit, exact', () => {
    for (let i = 0; i < SAMPLES; i++) {
      const q = generateQuestion('division', 'medium');
      const { a, b } = parse(q);
      expect(digits(a)).toBe(2);
      expect(digits(b)).toBe(1);
      expect(q.answer * b).toBe(a);
    }
  });

  it('hard: 3-digit ÷ 1-digit, or 2-digit ÷ 2-digit, exact', () => {
    let sawThreeByOne = false;
    let sawTwoByTwo = false;
    for (let i = 0; i < SAMPLES; i++) {
      const q = generateQuestion('division', 'hard');
      const { a, b } = parse(q);
      if (digits(b) === 1) {
        sawThreeByOne = true;
        expect(digits(a)).toBe(3);
      } else {
        sawTwoByTwo = true;
        expect(digits(a)).toBe(2);
        expect(digits(b)).toBe(2);
        expect(q.answer).toBeGreaterThanOrEqual(2);
      }
      expect(q.answer * b).toBe(a);
    }
    expect(sawThreeByOne).toBe(true);
    expect(sawTwoByTwo).toBe(true);
  });
});
