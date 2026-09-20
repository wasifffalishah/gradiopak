import React from 'react';
import { COMPASS } from '../../../constants/catalog';

interface CompassProps {
  direction: number;
  onChange: (deg: number) => void;
}

export const Compass: React.FC<CompassProps> = ({ direction, onChange }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">Direction</h3>
        <span className="text-xs font-mono text-mute">{direction}°</span>
      </div>

      <div className="flex items-center gap-4">
        {/* 3x3 Compass Grid */}
        <div className="grid grid-cols-3 gap-1 w-24 h-24 p-1 rounded-xl bg-surface-2 border border-line shrink-0">
          {COMPASS.map((deg, idx) => {
            if (deg === null) {
              return (
                <div
                  key={idx}
                  className="flex items-center justify-center rounded-md bg-surface-3 text-[10px] font-mono text-mute font-bold"
                >
                  {direction}°
                </div>
              );
            }
            const isSelected = Math.abs(direction - deg) % 360 === 0;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onChange(deg)}
                className={`flex items-center justify-center rounded-md text-[10px] font-mono transition-all ${
                  isSelected
                    ? 'bg-ink text-canvas font-bold shadow-sm'
                    : 'bg-surface-3/60 text-mute hover:bg-surface-3 hover:text-ink'
                }`}
                title={`${deg}°`}
              >
                {deg}°
              </button>
            );
          })}
        </div>

        {/* Free angle slider */}
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-mute">
            <span>Free angle</span>
            <input
              type="number"
              min={0}
              max={360}
              value={direction}
              onChange={e => onChange((parseInt(e.target.value) || 0) % 360)}
              className="w-14 px-1.5 py-0.5 text-xs font-mono text-right text-ink bg-surface-2 rounded border border-line focus:border-line-strong outline-none"
            />
          </div>
          <input
            type="range"
            min={0}
            max={360}
            value={direction}
            onChange={e => onChange(parseInt(e.target.value))}
            className="custom-range"
            style={
              {
                '--fill': `${(direction / 360) * 100}%`
              } as React.CSSProperties
            }
          />
        </div>
      </div>
    </div>
  );
};
