# MILO — The Mental Math Trainer: Design

**Date:** 2026-06-12
**Status:** Approved

## Overview

MILO is a speed mental-math game. The user races through 30 questions, one at a time, answering on an on-screen number pad. A correct answer instantly advances to the next question; the total time across all 30 questions is the score to beat. Scores are personal bests stored locally — no accounts, no backend.

## Platform & stack

- Web app: React + Vite + TypeScript, built as a static site.
- Mobile-first responsive layout; desktop keyboard input (digits 0–9, Backspace) also supported.
- No router and no state library. `App` holds a screen state machine: Setup → Game → Results. A refresh mid-game restarts the run, which is correct behavior for a timed race.

## Game modes & difficulty

- Five modes: **Mixed** (the main mode — default selection, featured first), Addition, Subtraction, Multiplication, Division.
- Three difficulties: easy, medium, hard.
- Mixed picks one of the four operations uniformly at random per question, at the selected difficulty.

## Gameplay flow

### Setup screen
- Mode picker with Mixed preselected and listed first; the four single-operation modes follow as focused practice options.
- Difficulty picker (easy / medium / hard).
- Shows the current best time for the selected mode + difficulty combo (or nothing if no best exists).
- Start button begins the run.

### Game screen
- Displays one question at a time (e.g. `47 + 38`), a progress counter (`12/30`), a running timer, and the current typed input.
- Number pad: digits 0–9, backspace, clear. A quit button returns to setup and discards the run.
- **Auto-advance:** input is checked after every digit. The moment the input equals the correct answer, the next question appears. There is no submit button and no penalty — wrong digits simply need to be backspaced or cleared.

### Results screen
- Total time for all 30 questions.
- "New best!" banner when the run beats the stored best; previous best shown for comparison.
- **Race again** (same settings) and **Change settings** buttons.

## Timing

Score = `performance.now()` captured on the 30th correct answer minus `performance.now()` captured at start. The visible ticking timer is display-only (updated on a ~100 ms interval); the recorded score is timestamp-exact and unaffected by render lag.

## Question generation

One generator per operation + difficulty (12 total), each returning a random valid `{ prompt, answer }`. Invariants for every generator: answers are whole numbers, results are never negative, and division is always exact (no remainders or decimals).

| | Easy | Medium | Hard |
|---|---|---|---|
| **Addition** | 1–20 + 1–20 | 2-digit + 2-digit, **no carrying** (each column sums ≤ 9) | 2-digit + 2-digit **with carrying**, or 3-digit + 2-digit (random pick between the two forms) |
| **Subtraction** | 1–20 − 1–20, no negatives | 2-digit − 2-digit **with borrowing** | 3-digit − 2-digit **with borrowing** |
| **Multiplication** | Times tables 1–10 | 1-digit × 2-digit, or teens × teens (12–19) | 2-digit × 2-digit |
| **Division** | Times-tables-based, exact | 2-digit ÷ 1-digit, exact | 3-digit ÷ 1-digit, or 2-digit ÷ 2-digit, exact |

- Carry/borrow constraints are satisfied constructively — digits are chosen to meet the column rules — rather than by rejection-sampling retry loops, so generation is O(1) per question.
- Subtraction is generated as inverted addition (pick addends, present `(a+b) − a`) where that fits the constraints, guaranteeing non-negative results.
- Division is generated as divisor × quotient = dividend, with divisor and quotient chosen so the dividend lands in the target digit range, guaranteeing exactness.
- A run is 30 questions generated up front when the game starts.

## Persistence

- Best time per mode + difficulty combo stored in `localStorage` under the key `milo:best:<mode>:<difficulty>` (15 possible keys: 5 modes × 3 difficulties).
- If `localStorage` is unavailable (private browsing, storage errors), the app degrades gracefully: no best times are shown or saved, and gameplay is unaffected.

## File structure

```
src/
  App.tsx                 # screen state machine; holds settings + last run result
  components/
    SetupScreen.tsx
    GameScreen.tsx
    ResultsScreen.tsx
    NumberPad.tsx
  hooks/
    useGame.ts            # question index, input string, auto-advance check, timestamps
  lib/
    questions.ts          # 12 generators + mixed; pure functions, most-tested module
    storage.ts            # best-time get/set with graceful failure
```

## Testing (Vitest)

- `questions.ts` — per-generator constraint assertions over many random samples:
  - medium addition never requires a carry; hard addition's 2-digit form always does
  - medium and hard subtraction always require a borrow; results never negative
  - division always exact; operands within their digit ranges for every generator
  - a run contains exactly 30 questions; mixed draws from all four operations
- `storage.ts` — best-time update logic (only overwrites when faster); storage-unavailable fallback.
- `useGame` — auto-advance fires exactly when input matches the answer, and not on partial/wrong input.

## Out of scope

Online leaderboards, accounts, statistics history/charts, sounds, additional question counts or timed modes. The design deliberately keeps MILO a small static site racing personal bests.
