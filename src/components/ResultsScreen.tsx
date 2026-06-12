import { useEffect, useState } from 'react';
import { formatTime } from '../lib/format';

const COUNT_UP_MS = 700;

function useCountUp(target: number): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / COUNT_UP_MS, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return value;
}

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
  const displayedTime = useCountUp(timeMs);
  return (
    <div className="screen results-screen">
      {isNewBest && <p className="new-best">New best!</p>}
      <p className="final-time">{formatTime(displayedTime)}</p>
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
