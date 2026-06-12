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
