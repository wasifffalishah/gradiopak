import React from 'react';
import { useStudio } from '../../../state/useStudioStore';
import { GENRES, RATIOS, TEXTURES, TYPES, TYPE_NOTE, TYPE_ORDER } from '../../../constants/catalog';
import { Slider } from '../Controls/Slider';
import { ColorRow } from '../Controls/ColorRow';
import { RotateCcw } from 'lucide-react';
import { GradientType, GenreType, TextureType } from '../../../types';

export const DesignTab: React.FC = () => {
  const { config, updateConfig, setStatus, resetStudio } = useStudio();

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Aspect Ratio */}
      <section id="secRatio" className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">Aspect Ratio</h3>
        <div className="grid grid-cols-3 gap-1.5">
          {RATIOS.map(([label, val]) => (
            <button
              key={val}
              type="button"
              onClick={() => updateConfig({ ratio: val })}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                config.ratio === val
                  ? 'bg-surface-4 text-ink border-line-strong shadow-sm'
                  : 'bg-surface-2 text-mute border-line hover:border-line-strong hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {/* Custom W x H */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-mute">Custom W × H</span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={200}
              max={4000}
              step={10}
              value={config.custW || 1600}
              onChange={e => updateConfig({ custW: parseInt(e.target.value) || 1600, ratio: 'custom' })}
              className="w-16 px-1.5 py-0.5 text-xs font-mono text-center text-ink bg-surface-2 rounded border border-line focus:border-line-strong outline-none"
            />
            <span className="text-ash">×</span>
            <input
              type="number"
              min={200}
              max={4000}
              step={10}
              value={config.custH || 900}
              onChange={e => updateConfig({ custH: parseInt(e.target.value) || 900, ratio: 'custom' })}
              className="w-16 px-1.5 py-0.5 text-xs font-mono text-center text-ink bg-surface-2 rounded border border-line focus:border-line-strong outline-none"
            />
          </div>
        </div>
      </section>

      {/* Shape / Generator Type */}
      <section id="secShape" className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">Shape / Generator</h3>
          <span className="text-xs font-mono text-mute">{config.type}</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {TYPE_ORDER.map(tName => {
            const isSelected = config.type === tName;
            return (
              <button
                key={tName}
                type="button"
                onClick={() => updateConfig({ type: tName as GradientType })}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-left truncate transition-all ${
                  isSelected
                    ? 'bg-surface-4 text-ink border-line-strong shadow-sm'
                    : 'bg-surface-2 text-mute border-line hover:border-line-strong hover:text-ink'
                }`}
                title={tName}
              >
                {tName}
              </button>
            );
          })}
        </div>
      </section>

      {/* Style & Material */}
      <section id="secGenre" className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">Style & Material</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {GENRES.map(([gName]) => {
            const isSelected = config.genre === gName;
            return (
              <button
                key={gName}
                type="button"
                onClick={() => updateConfig({ genre: gName as GenreType })}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-surface-4 text-ink border-line-strong shadow-sm'
                    : 'bg-surface-2 text-mute border-line hover:border-line-strong hover:text-ink'
                }`}
              >
                {gName}
              </button>
            );
          })}
        </div>
      </section>

      {/* Palette Colors */}
      <section id="secPalette">
        <ColorRow
          colors={config.colors}
          onChange={colors => updateConfig({ colors })}
          onSpotsUpdate={updater => updateConfig(prev => ({ ...prev, spots: updater(prev.spots) }))}
          onStatus={setStatus}
        />
      </section>

      {/* Field Dynamics Sliders */}
      <section id="secDynamics" className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">Field Dynamics</h3>
        <Slider
          label="Scale"
          value={config.scale}
          min={0}
          max={100}
          formatValue={v => `${v}%`}
          onChange={scale => updateConfig({ scale })}
        />
        <Slider
          label="Warp / Noise"
          value={config.distortion}
          min={0}
          max={100}
          formatValue={v => `${v}%`}
          onChange={distortion => updateConfig({ distortion })}
        />
        <Slider
          label="Speed"
          value={config.speed}
          min={20}
          max={300}
          formatValue={v => `${(v / 100).toFixed(2)}×`}
          onChange={speed => updateConfig({ speed })}
        />
        <Slider
          label="Direction"
          value={config.direction}
          min={0}
          max={360}
          formatValue={v => `${v}°`}
          onChange={direction => updateConfig({ direction })}
        />
      </section>

      {/* Surface Texture */}
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">Surface Texture</h3>
        <div className="grid grid-cols-3 gap-1.5">
          {TEXTURES.map(([tName]) => {
            const isSelected = config.texture === tName;
            return (
              <button
                key={tName}
                type="button"
                onClick={() => updateConfig({ texture: tName as TextureType })}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-surface-4 text-ink border-line-strong shadow-sm'
                    : 'bg-surface-2 text-mute border-line hover:border-line-strong hover:text-ink'
                }`}
              >
                {tName}
              </button>
            );
          })}
        </div>
      </section>

      {/* Design Tab Footer: Reset Button & Autosave Note */}
      <div className="flex items-center justify-between pt-3 pb-1 text-xs mt-1">
        <span className="text-mute text-[11px]">Design autosaves locally.</span>
        <button
          type="button"
          onClick={resetStudio}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 text-mute hover:text-ink border border-line hover:border-line-strong transition-colors font-medium text-xs shadow-sm"
          title="Restore the default composition"
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
