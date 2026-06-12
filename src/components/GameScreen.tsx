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

  const answerLength = String(game.question.answer).length;
  const isWrong = game.input.length >= answerLength;

  return (
    <div className="screen game-screen">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${(game.index / game.total) * 100}%` }} />
      </div>
      <header className="game-header">
        <button type="button" className="quit-button" onClick={onQuit} aria-label="Quit">
          ✕
        </button>
        <span className="progress">
          {game.index + 1}/{game.total}
        </span>
        <span className="timer">{formatTime(elapsed)}</span>
      </header>
      <div className="question" key={game.index}>
        {game.question.prompt}
      </div>
      <div className={isWrong ? 'answer-input wrong' : 'answer-input'} key={game.input}>
        <span className="answer-text">{game.input}</span>
        <span className="caret" aria-hidden="true" />
      </div>
      <NumberPad onDigit={game.pressDigit} onBackspace={game.backspace} onClear={game.clear} />
    </div>
  );
}
