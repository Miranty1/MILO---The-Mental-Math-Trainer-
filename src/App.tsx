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
