import React, { useEffect, useRef } from 'react';
import { useStudio } from '../../state/useStudioStore';
import { render2D } from '../../engine/canvas2d/fallbackRenderer';
import { createWebGLRenderer } from '../../engine/webgl/glRenderer';
import { X, RotateCcw } from 'lucide-react';

export const CompareBox: React.FC = () => {
  const { pinnedA, setPinnedA, updateConfig, setStatus } = useStudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!pinnedA || !canvasRef.current) return;
    const cv = canvasRef.current;
    const renderer = createWebGLRenderer(cv);
    if (renderer) {
      renderer.render(pinnedA, 320, 180, 0);
    } else {
      render2D(cv, pinnedA, 320, 180);
    }
  }, [pinnedA]);

  if (!pinnedA) return null;

  const handleAdoptA = () => {
    updateConfig(pinnedA);
    setPinnedA(null);
    setStatus('Pinned design A adopted.');
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-xl bg-surface-2/90 backdrop-blur-md border border-line shadow-xl">
      <div className="w-20 aspect-video rounded-lg overflow-hidden border border-line shrink-0">
        <canvas ref={canvasRef} className="w-full h-full object-cover" />
      </div>

      <div className="flex flex-col flex-1 truncate">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
          <span>Design A</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-accent-yellow/20 text-accent-yellow font-normal">
            Pinned
          </span>
        </div>
        <span className="text-[11px] font-mono text-mute truncate">
          {pinnedA.type} • {pinnedA.genre}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleAdoptA}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-ink text-canvas rounded-lg hover:opacity-90 transition-opacity"
        >
          <RotateCcw size={12} />
          <span>Use A</span>
        </button>
        <button
          type="button"
          onClick={() => setPinnedA(null)}
          className="p-1 text-mute hover:text-ink rounded transition-colors"
          title="Clear compare"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
