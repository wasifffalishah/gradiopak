import React, { useRef, useState } from 'react';
import { useStudio } from '../../state/useStudioStore';
import { validPairs, clamp } from '../../engine/colors/colorMath';

interface DraggableSpotsProps {
  frameRef: React.RefObject<HTMLDivElement | null>;
}

export const DraggableSpots: React.FC<DraggableSpotsProps> = ({ frameRef }) => {
  const { config, updateConfig, configRef, activeSpotIndex, setActiveSpotIndex } = useStudio();
  const draggingIdx = useRef<number | null>(null);
  const spotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [, setTick] = useState(0);

  // If curve mode is on, spots are hidden
  if (config.curve.on) return null;

  const pairs = validPairs(config);

  const handlePointerDown = (index: number, e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    draggingIdx.current = index;
    setActiveSpotIndex(index);

    const el = e.currentTarget;
    try {
      el.setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handlePointerMove = (index: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingIdx.current !== index || !frameRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = frameRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const x = clamp((e.clientX - rect.left) / rect.width, 0.02, 0.98);
    const y = clamp((e.clientY - rect.top) / rect.height, 0.02, 0.98);

    // Update mutable ref immediately so WebGL render loop reads 60fps coords
    if (!configRef.current.spots) {
      configRef.current.spots = [];
    }
    const nextSpots = [...configRef.current.spots];
    nextSpots[index] = [x, y];
    configRef.current.spots = nextSpots;

    // Directly update DOM element coordinates — ZERO React re-render, ZERO jitter/shake!
    const spotEl = spotRefs.current[index];
    if (spotEl) {
      spotEl.style.left = `${(x * 100).toFixed(2)}%`;
      spotEl.style.top = `${(y * 100).toFixed(2)}%`;
      if (x > 0.68) {
        spotEl.classList.add('flip');
      } else {
        spotEl.classList.remove('flip');
      }
    }
  };

  const handlePointerUp = (index: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingIdx.current === index) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {}
      draggingIdx.current = null;

      // Commit final position to store state once on drag completion
      if (configRef.current.spots) {
        updateConfig({ spots: [...configRef.current.spots] });
      }
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10">
      {pairs.map(([col, pt], i) => {
        const left = `${(pt[0] * 100).toFixed(2)}%`;
        const top = `${(pt[1] * 100).toFixed(2)}%`;
        const isSelected = activeSpotIndex === i;
        const isFlipped = pt[0] > 0.68;

        return (
          <div
            key={i}
            ref={el => { spotRefs.current[i] = el; }}
            onPointerDown={e => handlePointerDown(i, e)}
            onPointerMove={e => handlePointerMove(i, e)}
            onPointerUp={e => handlePointerUp(i, e)}
            onPointerCancel={e => handlePointerUp(i, e)}
            style={{ left, top }}
            className={`spot absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-[2.5px] border-white shadow-[0_0_0_1px_rgba(0,0,0,0.55),0_3px_10px_rgba(0,0,0,0.5)] cursor-grab active:cursor-grabbing pointer-events-auto touch-none transition-transform duration-100 group ${
              isSelected ? 'scale-115 ring-2 ring-white/40' : 'hover:scale-115'
            } ${isFlipped ? 'flip' : ''}`}
          >
            {/* Spot Tag Pill with color indicator and hex */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#0a0b0e]/95 text-[#e9eaef] text-[10px] font-semibold tracking-wider whitespace-nowrap shadow-[0_0_0_1px_rgba(255,255,255,0.15)] backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity ${
                isFlipped ? 'right-8' : 'left-8'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full inline-block shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3)]"
                style={{ backgroundColor: col }}
              />
              <code className="font-mono text-[9px] text-[#8f93a1] font-normal uppercase">
                {col}
              </code>
            </div>
          </div>
        );
      })}
    </div>
  );
};
