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
