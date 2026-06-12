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
