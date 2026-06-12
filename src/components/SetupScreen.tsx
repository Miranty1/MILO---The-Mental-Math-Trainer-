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
