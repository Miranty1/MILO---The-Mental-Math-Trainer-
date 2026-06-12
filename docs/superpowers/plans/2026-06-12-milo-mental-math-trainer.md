# MILO Mental Math Trainer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build MILO, a static web app where users race through 30 mental-math questions on an on-screen number pad, beating their own best time per mode + difficulty.

**Architecture:** React + Vite + TypeScript single-page app. `App` is a three-screen state machine (Setup → Game → Results). Pure logic lives in `src/lib/` (question generation, time formatting, localStorage bests); game state lives in a `useGame` hook; screens are presentational components. Spec: `docs/superpowers/specs/2026-06-12-milo-mental-math-trainer-design.md`.

**Tech Stack:** React 19, Vite 7, TypeScript, Vitest + jsdom + @testing-library/react.

---

## File structure

```
index.html
package.json
tsconfig.json
vite.config.ts
src/
  main.tsx                       # entry, StrictMode
  styles.css                     # all styling (mobile-first, dark)
  App.tsx                        # screen state machine
  components/
    SetupScreen.tsx              # mode/difficulty pickers, best time, Start
    GameScreen.tsx               # question, progress, timer, input, pad
    ResultsScreen.tsx            # final time, new-best banner, replay
    NumberPad.tsx                # 0–9 / clear / backspace grid
  hooks/
    useGame.ts                   # index, input, auto-advance, timestamps
    useGame.test.tsx
  lib/
    questions.ts                 # 12 generators + mixed + run builder
    questions.test.ts
    format.ts                    # formatTime(ms)
    format.test.ts
    storage.ts                   # best-time get/record with graceful failure
    storage.test.ts
```

---

### Task 0: Branch

- [ ] **Step 1: Create a feature branch**

```bash
git checkout -b milo-app
```

---

### Task 1: Scaffold the project

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx` (placeholder), `src/styles.css`, `.gitignore`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "milo",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@testing-library/react": "^16.3.0",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "@vitejs/plugin-react": "^4.5.0",
    "jsdom": "^26.0.0",
    "typescript": "~5.8.0",
    "vite": "^7.0.0",
    "vitest": "^3.2.0"
  }
}
```

- [ ] **Step 2: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Write `vite.config.ts`**

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
});
```

- [ ] **Step 4: Write `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MILO — Mental Math Trainer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Write `src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 6: Write placeholder `src/App.tsx`** (replaced in Task 8)

```tsx
export default function App() {
  return <h1 className="logo">MILO</h1>;
}
```

- [ ] **Step 7: Write `src/styles.css`**

```css
:root {
  color-scheme: dark;
  --bg: #11151c;
  --surface: #1b212c;
  --text: #f2f5f9;
  --muted: #8b95a5;
  --accent: #4f8cff;
  --accent-press: #3a6fd8;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
}

#root { display: flex; justify-content: center; min-height: 100vh; }

.screen {
  width: min(100vw, 430px);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem;
}

.logo { font-size: 3rem; letter-spacing: 0.3em; margin: 0; }
.tagline { color: var(--muted); margin: 0 0 1rem; }

.option-group { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; }
.option {
  padding: 0.6rem 1rem;
  border: 1px solid var(--surface);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text);
  font-size: 1rem;
  text-transform: capitalize;
  cursor: pointer;
}
.option.selected { border-color: var(--accent); background: var(--accent); }

.best-time { color: var(--muted); }

.start-button {
  padding: 0.9rem 3rem;
  border: none;
  border-radius: 12px;
  background: var(--accent);
  color: #fff;
  font-size: 1.3rem;
  font-weight: 600;
  cursor: pointer;
}
.start-button:active { background: var(--accent-press); }

.secondary-button {
  padding: 0.7rem 2rem;
  border: 1px solid var(--muted);
  border-radius: 12px;
  background: transparent;
  color: var(--text);
  font-size: 1rem;
  cursor: pointer;
}

.game-screen { justify-content: space-between; }
.game-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-variant-numeric: tabular-nums;
  color: var(--muted);
}
.quit-button {
  border: none;
  background: none;
  color: var(--muted);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.4rem;
}
.question { font-size: 3rem; font-weight: 600; }
.answer-input {
  font-size: 2.2rem;
  min-height: 3rem;
  min-width: 8rem;
  text-align: center;
  font-variant-numeric: tabular-nums;
  border-bottom: 2px solid var(--surface);
}
.number-pad {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
}
.pad-key {
  padding: 1.1rem 0;
  border: none;
  border-radius: 12px;
  background: var(--surface);
  color: var(--text);
  font-size: 1.6rem;
  cursor: pointer;
  touch-action: manipulation;
}
.pad-key:active { background: var(--accent-press); }

.new-best { color: #ffd75e; font-size: 1.4rem; font-weight: 700; margin: 0; }
.final-time { font-size: 3.5rem; font-weight: 700; margin: 0; font-variant-numeric: tabular-nums; }
.previous-best { color: var(--muted); margin: 0 0 1rem; }
```

- [ ] **Step 8: Write `.gitignore`**

```
node_modules
dist
```

- [ ] **Step 9: Install and verify the build**

Run: `npm install` then `npm run build`
Expected: install succeeds; build outputs `dist/` with no TypeScript errors.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + TypeScript project"
```

---

### Task 2: Question generators — addition & subtraction

**Files:**
- Create: `src/lib/questions.ts`
- Test: `src/lib/questions.test.ts`

All prompts use the format `"<a> <op> <b>"` with Unicode operators `+ − × ÷` (note `−` is U+2212, not a hyphen). Constraints are built constructively — digits are chosen so the carry/borrow rules hold — never by retry loops.

- [ ] **Step 1: Write failing tests** — `src/lib/questions.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { generateQuestion } from './questions';
import type { Question } from './questions';

const SAMPLES = 500;

export function parse(q: Question): { a: number; op: string; b: number } {
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
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `npx vitest run src/lib/questions.test.ts`
Expected: FAIL — cannot resolve `./questions` (file doesn't exist yet).

- [ ] **Step 3: Implement addition & subtraction** — `src/lib/questions.ts`:

```ts
export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division';
export type Mode = Operation | 'mixed';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  prompt: string;
  answer: number;
}

export const QUESTIONS_PER_RUN = 30;
export const OPERATIONS: Operation[] = ['addition', 'subtraction', 'multiplication', 'division'];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function additionEasy(): Question {
  const a = randInt(1, 20);
  const b = randInt(1, 20);
  return { prompt: `${a} + ${b}`, answer: a + b };
}

function additionMedium(): Question {
  // 2-digit + 2-digit where neither column carries
  const tensA = randInt(1, 8);
  const tensB = randInt(1, 9 - tensA);
  const unitsA = randInt(0, 9);
  const unitsB = randInt(0, 9 - unitsA);
  const a = tensA * 10 + unitsA;
  const b = tensB * 10 + unitsB;
  return { prompt: `${a} + ${b}`, answer: a + b };
}

function additionHard(): Question {
  if (randInt(0, 1) === 0) {
    // 2-digit + 2-digit with a guaranteed units carry
    const unitsA = randInt(1, 9);
    const unitsB = randInt(10 - unitsA, 9);
    const a = randInt(1, 9) * 10 + unitsA;
    const b = randInt(1, 9) * 10 + unitsB;
    return { prompt: `${a} + ${b}`, answer: a + b };
  }
  const a = randInt(100, 999);
  const b = randInt(10, 99);
  return { prompt: `${a} + ${b}`, answer: a + b };
}

function subtractionEasy(): Question {
  const a = randInt(1, 20);
  const b = randInt(1, a);
  return { prompt: `${a} − ${b}`, answer: a - b };
}

function subtractionMedium(): Question {
  // 2-digit − 2-digit with a guaranteed units borrow; minuend tens digit
  // exceeds subtrahend's so the answer stays positive
  const unitsB = randInt(1, 9);
  const unitsA = randInt(0, unitsB - 1);
  const tensB = randInt(1, 8);
  const tensA = randInt(tensB + 1, 9);
  const a = tensA * 10 + unitsA;
  const b = tensB * 10 + unitsB;
  return { prompt: `${a} − ${b}`, answer: a - b };
}

function subtractionHard(): Question {
  // 3-digit − 2-digit with a guaranteed units borrow
  const unitsB = randInt(1, 9);
  const unitsA = randInt(0, unitsB - 1);
  const a = randInt(1, 9) * 100 + randInt(0, 9) * 10 + unitsA;
  const b = randInt(1, 9) * 10 + unitsB;
  return { prompt: `${a} − ${b}`, answer: a - b };
}

const GENERATORS: Record<Operation, Record<Difficulty, () => Question>> = {
  addition: { easy: additionEasy, medium: additionMedium, hard: additionHard },
  subtraction: { easy: subtractionEasy, medium: subtractionMedium, hard: subtractionHard },
  multiplication: { easy: additionEasy, medium: additionEasy, hard: additionEasy }, // replaced in Task 3
  division: { easy: additionEasy, medium: additionEasy, hard: additionEasy }, // replaced in Task 3
};

export function generateQuestion(operation: Operation, difficulty: Difficulty): Question {
  return GENERATORS[operation][difficulty]();
}
```

- [ ] **Step 4: Run tests, verify they pass**

Run: `npx vitest run src/lib/questions.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/questions.ts src/lib/questions.test.ts
git commit -m "feat: addition and subtraction question generators"
```

---

### Task 3: Question generators — multiplication & division

**Files:**
- Modify: `src/lib/questions.ts`
- Test: `src/lib/questions.test.ts`

- [ ] **Step 1: Add failing tests** to `src/lib/questions.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests, verify the new ones fail**

Run: `npx vitest run src/lib/questions.test.ts`
Expected: the 6 new tests FAIL (generators still point at `additionEasy`); the 6 from Task 2 still pass.

- [ ] **Step 3: Implement multiplication & division** in `src/lib/questions.ts` (insert above `GENERATORS`, then fix the table):

```ts
function multiplicationEasy(): Question {
  const a = randInt(1, 10);
  const b = randInt(1, 10);
  return { prompt: `${a} × ${b}`, answer: a * b };
}

function multiplicationMedium(): Question {
  if (randInt(0, 1) === 0) {
    const a = randInt(2, 9);
    const b = randInt(10, 99);
    return { prompt: `${a} × ${b}`, answer: a * b };
  }
  const a = randInt(12, 19);
  const b = randInt(12, 19);
  return { prompt: `${a} × ${b}`, answer: a * b };
}

function multiplicationHard(): Question {
  const a = randInt(11, 99);
  const b = randInt(11, 99);
  return { prompt: `${a} × ${b}`, answer: a * b };
}

function divisionEasy(): Question {
  const divisor = randInt(2, 10);
  const quotient = randInt(2, 10);
  return { prompt: `${divisor * quotient} ÷ ${divisor}`, answer: quotient };
}

function divisionMedium(): Question {
  // 2-digit dividend ÷ 1-digit divisor, exact by construction
  const divisor = randInt(2, 9);
  const quotient = randInt(Math.ceil(10 / divisor), Math.floor(99 / divisor));
  return { prompt: `${divisor * quotient} ÷ ${divisor}`, answer: quotient };
}

function divisionHard(): Question {
  if (randInt(0, 1) === 0) {
    // 3-digit ÷ 1-digit
    const divisor = randInt(2, 9);
    const quotient = randInt(Math.ceil(100 / divisor), Math.floor(999 / divisor));
    return { prompt: `${divisor * quotient} ÷ ${divisor}`, answer: quotient };
  }
  // 2-digit ÷ 2-digit, quotient ≥ 2 so it is never the trivial n ÷ n
  const divisor = randInt(10, 49);
  const quotient = randInt(2, Math.floor(99 / divisor));
  return { prompt: `${divisor * quotient} ÷ ${divisor}`, answer: quotient };
}
```

Update the table:

```ts
const GENERATORS: Record<Operation, Record<Difficulty, () => Question>> = {
  addition: { easy: additionEasy, medium: additionMedium, hard: additionHard },
  subtraction: { easy: subtractionEasy, medium: subtractionMedium, hard: subtractionHard },
  multiplication: { easy: multiplicationEasy, medium: multiplicationMedium, hard: multiplicationHard },
  division: { easy: divisionEasy, medium: divisionMedium, hard: divisionHard },
};
```

- [ ] **Step 4: Run tests, verify all pass**

Run: `npx vitest run src/lib/questions.test.ts`
Expected: PASS (12 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/questions.ts src/lib/questions.test.ts
git commit -m "feat: multiplication and division question generators"
```

---

### Task 4: Run builder & mixed mode

**Files:**
- Modify: `src/lib/questions.ts`
- Test: `src/lib/questions.test.ts`

- [ ] **Step 1: Add failing tests** to `src/lib/questions.test.ts` (import `generateQuestions` and `QUESTIONS_PER_RUN` from `./questions`):

```ts
describe('generateQuestions', () => {
  it('generates 30 questions by default', () => {
    expect(generateQuestions('addition', 'easy')).toHaveLength(QUESTIONS_PER_RUN);
  });

  it('single-operation modes only use that operation', () => {
    const ops = new Set(generateQuestions('multiplication', 'easy', 100).map((q) => parse(q).op));
    expect([...ops]).toEqual(['×']);
  });

  it('mixed mode draws from all four operations', () => {
    const ops = new Set(generateQuestions('mixed', 'easy', 400).map((q) => parse(q).op));
    expect([...ops].sort()).toEqual(['+', '×', '÷', '−'].sort());
  });
});
```

- [ ] **Step 2: Run tests, verify the new ones fail**

Run: `npx vitest run src/lib/questions.test.ts`
Expected: new tests FAIL — `generateQuestions` is not exported.

- [ ] **Step 3: Implement** — append to `src/lib/questions.ts`:

```ts
export function generateQuestions(
  mode: Mode,
  difficulty: Difficulty,
  count = QUESTIONS_PER_RUN,
): Question[] {
  return Array.from({ length: count }, () => {
    const operation = mode === 'mixed' ? OPERATIONS[randInt(0, OPERATIONS.length - 1)] : mode;
    return generateQuestion(operation, difficulty);
  });
}
```

- [ ] **Step 4: Run tests, verify all pass**

Run: `npx vitest run src/lib/questions.test.ts`
Expected: PASS (15 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/questions.ts src/lib/questions.test.ts
git commit -m "feat: run builder with mixed mode"
```

---

### Task 5: Time formatting

**Files:**
- Create: `src/lib/format.ts`
- Test: `src/lib/format.test.ts`

- [ ] **Step 1: Write failing tests** — `src/lib/format.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `npx vitest run src/lib/format.test.ts`
Expected: FAIL — cannot resolve `./format`.

- [ ] **Step 3: Implement** — `src/lib/format.ts`:

```ts
export function formatTime(ms: number): string {
  const totalTenths = Math.floor(ms / 100);
  const tenths = totalTenths % 10;
  const totalSeconds = Math.floor(totalTenths / 10);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  if (minutes === 0) return `${seconds}.${tenths}s`;
  return `${minutes}:${String(seconds).padStart(2, '0')}.${tenths}`;
}
```

- [ ] **Step 4: Run tests, verify they pass**

Run: `npx vitest run src/lib/format.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/format.ts src/lib/format.test.ts
git commit -m "feat: time formatting"
```

---

### Task 6: Best-time storage

**Files:**
- Create: `src/lib/storage.ts`
- Test: `src/lib/storage.test.ts`

- [ ] **Step 1: Write failing tests** — `src/lib/storage.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `npx vitest run src/lib/storage.test.ts`
Expected: FAIL — cannot resolve `./storage`.

- [ ] **Step 3: Implement** — `src/lib/storage.ts`:

```ts
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
```

- [ ] **Step 4: Run tests, verify they pass**

Run: `npx vitest run src/lib/storage.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage.ts src/lib/storage.test.ts
git commit -m "feat: best-time storage with graceful failure"
```

---

### Task 7: useGame hook

**Files:**
- Create: `src/hooks/useGame.ts`
- Test: `src/hooks/useGame.test.tsx`

- [ ] **Step 1: Write failing tests** — `src/hooks/useGame.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `npx vitest run src/hooks/useGame.test.tsx`
Expected: FAIL — cannot resolve `./useGame`.

- [ ] **Step 3: Implement** — `src/hooks/useGame.ts`:

```ts
import { useCallback, useRef, useState } from 'react';
import type { Question } from '../lib/questions';

const MAX_INPUT_LENGTH = 4; // longest possible answer is 4 digits (99 × 99 = 9801)

export interface Game {
  index: number;
  total: number;
  input: string;
  question: Question;
  startTime: number;
  pressDigit: (digit: string) => void;
  backspace: () => void;
  clear: () => void;
}

export function useGame(questions: Question[], onFinish: (timeMs: number) => void): Game {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const startTimeRef = useRef(performance.now());
  const finishedRef = useRef(false);

  const pressDigit = useCallback(
    (digit: string) => {
      if (finishedRef.current || input.length >= MAX_INPUT_LENGTH) return;
      const next = input + digit;
      if (Number(next) !== questions[index].answer) {
        setInput(next);
        return;
      }
      if (index + 1 === questions.length) {
        finishedRef.current = true;
        onFinish(performance.now() - startTimeRef.current);
        return;
      }
      setIndex(index + 1);
      setInput('');
    },
    [input, index, questions, onFinish],
  );

  const backspace = useCallback(() => setInput((s) => s.slice(0, -1)), []);
  const clear = useCallback(() => setInput(''), []);

  return {
    index,
    total: questions.length,
    input,
    question: questions[index],
    startTime: startTimeRef.current,
    pressDigit,
    backspace,
    clear,
  };
}
```

- [ ] **Step 4: Run tests, verify they pass**

Run: `npx vitest run src/hooks/useGame.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useGame.ts src/hooks/useGame.test.tsx
git commit -m "feat: useGame hook with auto-advance"
```

---

### Task 8: Screens, number pad, and App wiring

**Files:**
- Create: `src/components/NumberPad.tsx`, `src/components/GameScreen.tsx`, `src/components/SetupScreen.tsx`, `src/components/ResultsScreen.tsx`
- Modify: `src/App.tsx` (replace placeholder)

These are presentational components wired to the tested logic; they're verified by the type-checking build plus the manual playthrough in Task 9.

- [ ] **Step 1: Write `src/components/NumberPad.tsx`**

```tsx
interface NumberPadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];

export function NumberPad({ onDigit, onBackspace, onClear }: NumberPadProps) {
  const press = (key: string) => {
    if (key === 'C') onClear();
    else if (key === '⌫') onBackspace();
    else onDigit(key);
  };
  return (
    <div className="number-pad">
      {KEYS.map((key) => (
        <button key={key} type="button" className="pad-key" onClick={() => press(key)}>
          {key}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/GameScreen.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { useGame } from '../hooks/useGame';
import { formatTime } from '../lib/format';
import type { Question } from '../lib/questions';
import { NumberPad } from './NumberPad';

interface GameScreenProps {
  questions: Question[];
  onFinish: (timeMs: number) => void;
  onQuit: () => void;
}

export function GameScreen({ questions, onFinish, onQuit }: GameScreenProps) {
  const game = useGame(questions, onFinish);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(performance.now() - game.startTime), 100);
    return () => clearInterval(timer);
  }, [game.startTime]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key >= '0' && event.key <= '9') game.pressDigit(event.key);
      else if (event.key === 'Backspace') game.backspace();
      else if (event.key === 'Escape') game.clear();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [game.pressDigit, game.backspace, game.clear]);

  return (
    <div className="screen game-screen">
      <header className="game-header">
        <button type="button" className="quit-button" onClick={onQuit} aria-label="Quit">
          ✕
        </button>
        <span className="progress">
          {game.index + 1}/{game.total}
        </span>
        <span className="timer">{formatTime(elapsed)}</span>
      </header>
      <div className="question">{game.question.prompt}</div>
      <div className="answer-input">{game.input || ' '}</div>
      <NumberPad onDigit={game.pressDigit} onBackspace={game.backspace} onClear={game.clear} />
    </div>
  );
}
```

- [ ] **Step 3: Write `src/components/SetupScreen.tsx`**

```tsx
import { formatTime } from '../lib/format';
import type { Difficulty, Mode } from '../lib/questions';
import { getBestTime } from '../lib/storage';

const MODES: { value: Mode; label: string }[] = [
  { value: 'mixed', label: 'Mixed' },
  { value: 'addition', label: 'Addition' },
  { value: 'subtraction', label: 'Subtraction' },
  { value: 'multiplication', label: 'Multiplication' },
  { value: 'division', label: 'Division' },
];

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

interface SetupScreenProps {
  mode: Mode;
  difficulty: Difficulty;
  onModeChange: (mode: Mode) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onStart: () => void;
}

export function SetupScreen({
  mode,
  difficulty,
  onModeChange,
  onDifficultyChange,
  onStart,
}: SetupScreenProps) {
  const best = getBestTime(mode, difficulty);
  return (
    <div className="screen setup-screen">
      <h1 className="logo">MILO</h1>
      <p className="tagline">30 questions. How fast can you go?</p>
      <div className="option-group">
        {MODES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={value === mode ? 'option selected' : 'option'}
            onClick={() => onModeChange(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="option-group">
        {DIFFICULTIES.map((value) => (
          <button
            key={value}
            type="button"
            className={value === difficulty ? 'option selected' : 'option'}
            onClick={() => onDifficultyChange(value)}
          >
            {value}
          </button>
        ))}
      </div>
      <p className="best-time">{best !== null ? `Best: ${formatTime(best)}` : 'No best time yet'}</p>
      <button type="button" className="start-button" onClick={onStart}>
        Start
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Write `src/components/ResultsScreen.tsx`**

```tsx
import { formatTime } from '../lib/format';

interface ResultsScreenProps {
  timeMs: number;
  isNewBest: boolean;
  previousBest: number | null;
  onRaceAgain: () => void;
  onChangeSettings: () => void;
}

export function ResultsScreen({
  timeMs,
  isNewBest,
  previousBest,
  onRaceAgain,
  onChangeSettings,
}: ResultsScreenProps) {
  return (
    <div className="screen results-screen">
      {isNewBest && <p className="new-best">New best!</p>}
      <p className="final-time">{formatTime(timeMs)}</p>
      <p className="previous-best">
        {previousBest !== null ? `Previous best: ${formatTime(previousBest)}` : 'First completed run!'}
      </p>
      <button type="button" className="start-button" onClick={onRaceAgain}>
        Race again
      </button>
      <button type="button" className="secondary-button" onClick={onChangeSettings}>
        Change settings
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Replace `src/App.tsx`**

`runId` keys `GameScreen` so every run remounts it, resetting the hook state and start time.

```tsx
import { useState } from 'react';
import { GameScreen } from './components/GameScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { SetupScreen } from './components/SetupScreen';
import { generateQuestions } from './lib/questions';
import type { Difficulty, Mode, Question } from './lib/questions';
import { recordTime } from './lib/storage';

type Screen = 'setup' | 'game' | 'results';

interface RunResult {
  timeMs: number;
  isNewBest: boolean;
  previousBest: number | null;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('setup');
  const [mode, setMode] = useState<Mode>('mixed');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [runId, setRunId] = useState(0);
  const [result, setResult] = useState<RunResult | null>(null);

  const startRun = () => {
    setQuestions(generateQuestions(mode, difficulty));
    setRunId((id) => id + 1);
    setScreen('game');
  };

  const finishRun = (timeMs: number) => {
    const { isNewBest, previousBest } = recordTime(mode, difficulty, timeMs);
    setResult({ timeMs, isNewBest, previousBest });
    setScreen('results');
  };

  if (screen === 'game') {
    return (
      <GameScreen
        key={runId}
        questions={questions}
        onFinish={finishRun}
        onQuit={() => setScreen('setup')}
      />
    );
  }
  if (screen === 'results' && result) {
    return (
      <ResultsScreen
        {...result}
        onRaceAgain={startRun}
        onChangeSettings={() => setScreen('setup')}
      />
    );
  }
  return (
    <SetupScreen
      mode={mode}
      difficulty={difficulty}
      onModeChange={setMode}
      onDifficultyChange={setDifficulty}
      onStart={startRun}
    />
  );
}
```

- [ ] **Step 6: Verify the full build and test suite**

Run: `npm test && npm run build`
Expected: all suites pass (questions 15, format 2, storage 8, useGame 5); build succeeds with no type errors.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/components
git commit -m "feat: screens, number pad, and app wiring"
```

---

### Task 9: End-to-end verification

- [ ] **Step 1: Run the full suite and build**

Run: `npm test && npm run build`
Expected: all tests pass; production build succeeds.

- [ ] **Step 2: Manual playthrough**

Run: `npm run dev`, open the printed URL, then verify:
- Setup: Mixed is preselected and listed first; switching mode/difficulty updates the best-time line ("No best time yet" on first visit).
- Game: question, `1/30` progress, ticking timer; typing the correct answer (pad or keyboard) advances instantly with no submit; wrong digits stay until Backspace/C; Escape clears; ✕ returns to setup.
- Finish a 30-question easy run: Results shows total time and "New best!"; **Race again** starts a fresh run with new questions and a reset timer; finishing slower shows no banner and keeps the old best; **Change settings** returns to setup, which now shows the best; the best survives a page reload.

- [ ] **Step 3: Done**

Implementation complete — proceed to the finishing-a-development-branch skill.
