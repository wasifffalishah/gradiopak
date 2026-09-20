import React, { useState, useMemo, useCallback } from 'react';
import { useStudio } from '../../../state/useStudioStore';
import { PRESETS } from '../../../constants/presets';
import { UI_GRADIENTS } from '../../../constants/uiGradients';
import { SPOT_DEFAULTS } from '../../../constants/catalog';
import { Preset, UiGradientItem } from '../../../types';
import { PresetThumb } from '../Controls/PresetThumb';
import { Search } from 'lucide-react';

const PresetCard = React.memo<{
  preset: Preset;
  onSelect: (p: Preset) => void;
}>(({ preset, onSelect }) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(preset)}
      className="group flex flex-col gap-2 p-2 rounded-xl bg-surface-2/60 border border-line hover:border-line-strong hover:bg-surface-2 transition-all text-left cursor-pointer active:scale-[0.98]"
    >
      <div className="w-full aspect-[16/10] rounded-lg overflow-hidden shadow-inner bg-[#0a0b0e]">
        <PresetThumb preset={preset} />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-semibold text-ink truncate">{preset.name}</span>
          <span className="text-[10px] text-mute/80 shrink-0 font-serif italic">
            {preset.jp}
          </span>
        </div>
        <span className="text-[10px] font-mono text-mute">
          {preset.type} • {preset.genre}
        </span>
      </div>
    </button>
  );
});

const UiGradientCard = React.memo<{
  item: UiGradientItem;
  onSelect: (g: UiGradientItem) => void;
}>(({ item, onSelect }) => {
  const gradStyle = `linear-gradient(135deg, ${item.colors.join(', ')})`;
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="group flex flex-col gap-1.5 p-2 rounded-xl bg-surface-2/60 border border-line hover:border-line-strong hover:bg-surface-2 transition-all text-left cursor-pointer active:scale-[0.98]"
    >
      <div
        className="w-full aspect-[16/9] rounded-lg shadow-inner group-hover:scale-[1.02] transition-transform"
        style={{ background: gradStyle }}
      />
      <span className="text-xs font-medium text-ink truncate">{item.name}</span>
    </button>
  );
});

export const PresetsTab: React.FC = () => {
  const { updateConfig, setStatus } = useStudio();
  const [search, setSearch] = useState('');
  const [activeSource, setActiveSource] = useState<'builtin' | 'uigradients'>('builtin');

  const filteredPresets = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return PRESETS;
    return PRESETS.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.jp.toLowerCase().includes(q) ||
        p.genre.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q)
    );
  }, [search]);

  const filteredUiGradients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return UI_GRADIENTS;
    return UI_GRADIENTS.filter(g => g.name.toLowerCase().includes(q));
  }, [search]);

  const applyBuiltinPreset = useCallback((p: Preset) => {
    updateConfig(prev => ({
      ...prev,
      type: p.type,
      genre: p.genre,
      texture: p.texture,
      direction: p.direction,
      colors: p.colors.slice(),
      spots: (p.spots || SPOT_DEFAULTS.slice(0, p.colors.length)).map(pt => [pt[0], pt[1]])
    }));
    setStatus(`Preset "${p.name}" applied.`);
  }, [updateConfig, setStatus]);

  const applyUiGradient = useCallback((g: UiGradientItem) => {
    updateConfig(prev => ({
      ...prev,
      colors: g.colors.slice(),
      spots: SPOT_DEFAULTS.slice(0, g.colors.length).map(pt => [pt[0], pt[1]])
    }));
    setStatus(`Palette "${g.name}" applied.`);
  }, [updateConfig, setStatus]);

  return (
    <div id="secPresets" className="flex flex-col gap-4 p-4">
      {/* Source Selector Tabs */}
      <div className="flex items-center gap-1 p-1 bg-surface-2 rounded-lg border border-line">
        <button
          type="button"
          onClick={() => setActiveSource('builtin')}
          className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
            activeSource === 'builtin'
              ? 'bg-surface-4 text-ink shadow-sm'
              : 'text-mute hover:text-ink'
          }`}
        >
          Studio Presets ({PRESETS.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSource('uigradients')}
          className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
            activeSource === 'uigradients'
              ? 'bg-surface-4 text-ink shadow-sm'
              : 'text-mute hover:text-ink'
          }`}
        >
          uiGradients ({UI_GRADIENTS.length})
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-mute" />
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={
            activeSource === 'builtin'
              ? 'Search presets…'
              : 'Search uiGradients…'
          }
          className="w-full pl-8 pr-2.5 py-1.5 text-xs text-ink bg-surface-2 rounded-lg border border-line focus:border-line-strong outline-none"
        />
      </div>

      {/* Presets List Grid */}
      {activeSource === 'builtin' ? (
        <div className="grid grid-cols-2 gap-2 pr-0.5">
          {filteredPresets.map(preset => (
            <PresetCard
              key={preset.name}
              preset={preset}
              onSelect={applyBuiltinPreset}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 pr-0.5">
          {filteredUiGradients.map((item, i) => (
            <UiGradientCard
              key={`${item.name}-${i}`}
              item={item}
              onSelect={applyUiGradient}
            />
          ))}
        </div>
      )}
    </div>
  );
};
