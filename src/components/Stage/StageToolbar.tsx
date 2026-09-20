import React, { useMemo } from 'react';
import { useStudio } from '../../state/useStudioStore';
import { PRESETS } from '../../constants/presets';
import { Shuffle, Pin, Film, Play, Pause, Maximize } from 'lucide-react';

export const StageToolbar: React.FC = () => {
  const {
    config,
    updateConfig,
    shufflePalette,
    pinnedA,
    setPinnedA,
    isReel,
    setIsReel,
    isFullscreen,
    setIsFullscreen,
    setStatus,
    statusMessage
  } = useStudio();

  // Find exact matching preset or fall back to 'Custom'
  const matchedPreset = useMemo(() => {
    return PRESETS.find(p => {
      if (
        p.genre !== config.genre ||
        p.type !== config.type ||
        p.texture !== config.texture ||
        p.direction !== config.direction
      ) {
        return false;
      }
      if (p.colors.length !== config.colors.length) return false;
      return p.colors.every((c, i) => c.toUpperCase() === config.colors[i]?.toUpperCase());
    });
  }, [config.genre, config.type, config.texture, config.direction, config.colors]);

  const presetName = matchedPreset ? matchedPreset.name : 'Custom';
  const presetJp = matchedPreset?.jp;

  const handleTogglePin = () => {
    if (pinnedA) {
      setPinnedA(null);
      setStatus('Cleared compare pin.');
    } else {
      setPinnedA(JSON.parse(JSON.stringify(config)));
      setStatus('Pinned current design as A. Keep editing B to compare.');
    }
  };

  const handleToggleAnim = () => {
    updateConfig(prev => {
      const next = !prev.animate;
      setStatus(next ? 'Animation playing.' : 'Animation paused.');
      return { ...prev, animate: next };
    });
  };

  const handleToggleReel = () => {
    setIsReel(prev => {
      const next = !prev;
      setStatus(next ? 'Preset reel started.' : 'Preset reel stopped.');
      return next;
    });
  };

  const handleShuffle = () => {
    shufflePalette();
  };

  const handleFullscreen = () => {
    setIsFullscreen(true);
    setStatus('Fullscreen preview active (press Esc to exit).');
  };

  return (
    <div className="flex flex-col gap-1 w-full pt-1">
      {/* Stage Foot: Meta information on left, Action buttons on right */}
      <div id="stageToolbar" className="flex items-center justify-between gap-4 py-1.5 px-1 flex-wrap">
        {/* Meta text line styled exactly like original Gradiopak */}
        <div className="meta flex items-baseline flex-wrap gap-x-2 gap-y-0.5 text-xs text-[#8e919b] min-w-0">
          <b className="font-semibold text-[15px] text-[#f3f4f8] tracking-tight">{presetName}</b>
          {presetJp && (
            <span className="text-[#61646d] text-[11px] italic font-normal">{presetJp}</span>
          )}
          <span className="text-[#36383f]">·</span>
          <span className="text-[#8e919b] uppercase text-[9.5px] tracking-widest font-semibold">
            {config.type.toLowerCase()} · {config.genre} · {config.texture.toLowerCase()}
          </span>
        </div>

        {/* Action buttons styled with original icon buttons */}
        <div id="stageActions" className="flex items-center gap-1.5 shrink-0 ml-auto">
          <button
            type="button"
            onClick={handleShuffle}
            className="p-2 rounded-xl text-[#8e919b] hover:text-[#f3f4f8] hover:bg-surface-3 border border-line hover:border-line-strong transition-all"
            title="Shuffle palette"
          >
            <Shuffle size={15} />
          </button>

          <button
            type="button"
            onClick={handleTogglePin}
            className={`p-2 rounded-xl border transition-all ${
              pinnedA
                ? 'bg-surface-4 text-accent-yellow border-accent-yellow/40'
                : 'text-[#8e919b] hover:text-[#f3f4f8] hover:bg-surface-3 border-line hover:border-line-strong'
            }`}
            title="Pin current design as A and compare while editing"
          >
            <Pin size={15} />
          </button>

          <button
            type="button"
            onClick={handleToggleReel}
            className={`p-2 rounded-xl border transition-all ${
              isReel
                ? 'bg-surface-4 text-accent-green border-accent-green/40 animate-pulse'
                : 'text-[#8e919b] hover:text-[#f3f4f8] hover:bg-surface-3 border-line hover:border-line-strong'
            }`}
            title="Preset reel — auto-cycle presets like a screensaver"
          >
            <Film size={15} />
          </button>

          <button
            type="button"
            onClick={handleToggleAnim}
            className={`p-2 rounded-xl border transition-all ${
              config.animate
                ? 'bg-surface-4 text-[#f3f4f8] border-line-strong'
                : 'text-[#8e919b] hover:text-[#f3f4f8] hover:bg-surface-3 border-line'
            }`}
            title={config.animate ? 'Pause animation' : 'Play animation'}
          >
            {config.animate ? <Pause size={15} /> : <Play size={15} />}
          </button>

          <button
            type="button"
            onClick={handleFullscreen}
            className="p-2 rounded-xl text-[#8e919b] hover:text-[#f3f4f8] hover:bg-surface-3 border border-line hover:border-line-strong transition-all"
            title="Fullscreen animation"
          >
            <Maximize size={15} />
          </button>
        </div>
      </div>

      {/* Polite Live Status Line (Exact style from original Gradiopak) */}
      <p
        id="status"
        role="status"
        aria-live="polite"
        className="font-mono text-[11.5px] text-[#8e919b] min-h-[1.5em] px-1.5 m-0 transition-opacity duration-200"
      >
        {statusMessage || ''}
      </p>
    </div>
  );
};
