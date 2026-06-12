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
