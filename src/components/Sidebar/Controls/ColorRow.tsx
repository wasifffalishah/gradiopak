import React, { useRef } from 'react';
import { colorName, lighten, usableFrom } from '../../../engine/colors/colorMath';
import { SPOT_DEFAULTS } from '../../../constants/catalog';
import { Trash2, Shuffle, Image as ImageIcon, Plus } from 'lucide-react';

interface ColorRowProps {
  colors: string[];
  onChange: (colors: string[]) => void;
  onSpotsUpdate: (updater: (prevSpots: [number, number][]) => [number, number][]) => void;
  onStatus: (msg: string) => void;
}

export const ColorRow: React.FC<ColorRowProps> = ({
  colors,
  onChange,
  onSpotsUpdate,
  onStatus
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleColorChange = (index: number, hex: string) => {
    const next = [...colors];
    next[index] = hex.toUpperCase();
    onChange(next);
  };

  const handleRemoveColor = (index: number) => {
    if (colors.length <= 2) {
      onStatus('Minimum 2 colors required');
      return;
    }
    const next = colors.filter((_, i) => i !== index);
    onChange(next);
    onSpotsUpdate(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddColor = () => {
    if (colors.length >= 8) {
      onStatus('Maximum 8 colors reached');
      return;
    }
    const n = colors.length;
    const base = usableFrom(colors);
    const newColor = lighten(base[n % base.length], 0.35);
    onChange([...colors, newColor]);
    onSpotsUpdate(prev => [...prev, SPOT_DEFAULTS[n % SPOT_DEFAULTS.length]]);
  };

  // Image palette extraction
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const cv = document.createElement('canvas');
      cv.width = 120;
      cv.height = 120;
      const ctx = cv.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, 120, 120);
      const data = ctx.getImageData(0, 0, 120, 120).data;
      const extracted: string[] = [];
      const step = Math.floor(data.length / (4 * 5));
      for (let i = 0; i < 5; i++) {
        const offset = i * step * 4;
        const r = data[offset].toString(16).padStart(2, '0');
        const g = data[offset + 1].toString(16).padStart(2, '0');
        const b = data[offset + 2].toString(16).padStart(2, '0');
        extracted.push(`#${r}${g}${b}`.toUpperCase());
      }
      onChange(extracted);
      onSpotsUpdate(() => SPOT_DEFAULTS.slice(0, extracted.length).map(p => [p[0], p[1]]));
      onStatus(`Extracted ${extracted.length} colors from image`);
    };
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">Palette Colors</h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-mute hover:text-ink hover:bg-surface-3 rounded transition-colors"
            title="Pull a palette out of any image"
          >
            <ImageIcon size={12} />
            <span>Image</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleImageFile}
          />
          <button
            type="button"
            onClick={handleAddColor}
            disabled={colors.length >= 8}
            className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-mute hover:text-ink hover:bg-surface-3 disabled:opacity-40 rounded transition-colors"
          >
            <Plus size={12} />
            <span>Add</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {colors.map((hex, i) => (
          <div
            key={i}
            className="flex items-center gap-2 p-1.5 rounded-lg bg-surface-2/60 border border-line hover:border-line-strong transition-colors"
          >
            <div className="relative w-7 h-7 rounded-md overflow-hidden border border-line-strong shrink-0 shadow-inner">
              <input
                type="color"
                value={hex}
                onChange={e => handleColorChange(i, e.target.value)}
                className="absolute -inset-2 w-12 h-12 cursor-pointer opacity-0"
              />
              <div className="w-full h-full" style={{ backgroundColor: hex }} />
            </div>

            <input
              type="text"
              value={hex}
              maxLength={7}
              onChange={e => {
                let v = e.target.value.toUpperCase();
                if (!v.startsWith('#')) v = '#' + v;
                handleColorChange(i, v);
              }}
              className="w-20 px-2 py-0.5 text-xs font-mono text-ink bg-surface-3 rounded border border-transparent focus:border-line-strong outline-none"
            />

            <span className="text-[11px] font-mono text-mute truncate flex-1">
              {colorName(hex)}
            </span>

            {colors.length > 2 && (
              <button
                type="button"
                onClick={() => handleRemoveColor(i)}
                className="p-1 text-mute hover:text-accent-red transition-colors rounded"
                title="Remove color"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
