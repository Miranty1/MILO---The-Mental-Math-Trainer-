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

const GENERATORS: Record<Operation, Record<Difficulty, () => Question>> = {
  addition: { easy: additionEasy, medium: additionMedium, hard: additionHard },
  subtraction: { easy: subtractionEasy, medium: subtractionMedium, hard: subtractionHard },
  multiplication: { easy: multiplicationEasy, medium: multiplicationMedium, hard: multiplicationHard },
  division: { easy: divisionEasy, medium: divisionMedium, hard: divisionHard },
};

export function generateQuestion(operation: Operation, difficulty: Difficulty): Question {
  return GENERATORS[operation][difficulty]();
}
