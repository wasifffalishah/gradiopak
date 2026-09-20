import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  formatValue?: (val: number) => string;
  onChange: (val: number) => void;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  formatValue,
  onChange,
  className = ''
}) => {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const displayVal = formatValue ? formatValue(value) : `${value}${unit}`;

  return (
    <div className={`flex flex-col gap-1.5 py-1 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-mute font-medium tracking-wide">{label}</span>
        <span className="text-ink font-mono font-medium">{displayVal}</span>
      </div>
      <input
        type="range"
        className="custom-range"
        style={{ '--fill': `${pct}%` } as React.CSSProperties}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
};
