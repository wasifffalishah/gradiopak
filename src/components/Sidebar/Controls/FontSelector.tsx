import React, { useState, useMemo, useRef } from 'react';
import { FONTS, FONT_CATS, FontEntry } from '../../../constants/fonts';
import { loadFont } from '../../../engine/canvas2d/layerRenderer';
import { Search, Upload } from 'lucide-react';

interface FontSelectorProps {
  selectedFont: string;
  selectedWeight: string;
  onFontChange: (font: string) => void;
  onWeightChange: (weight: string) => void;
}

export const FontSelector: React.FC<FontSelectorProps> = ({
  selectedFont,
  selectedWeight,
  onFontChange,
  onWeightChange
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [customFonts, setCustomFonts] = useState<FontEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allFonts = useMemo(() => {
    return [...customFonts, ...FONTS];
  }, [customFonts]);

  const filteredFonts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allFonts.filter(f => {
      const matchCat = selectedCat === 'all' || f.cat === selectedCat;
      const matchSearch = !q || f.name.toLowerCase().includes(q) || f.cssName.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [allFonts, search, selectedCat]);

  const activeEntry = useMemo(() => {
    return allFonts.find(f => f.name === selectedFont) || allFonts[0];
  }, [allFonts, selectedFont]);

  const handleFontSelect = (font: FontEntry) => {
    loadFont(font.name);
    onFontChange(font.name);
    if (!font.weights.includes(Number(selectedWeight))) {
      onWeightChange(String(font.weights[0] || 400));
    }
  };

  const handleUploadFont = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fontName = file.name.replace(/\.[^/.]+$/, '');
    const reader = new FileReader();
    reader.onload = ev => {
      const result = ev.target?.result as ArrayBuffer;
      const font = new FontFace(fontName, result);
      font.load().then(loadedFace => {
        (document.fonts as any).add(loadedFace);
        const newEntry: FontEntry = {
          name: fontName,
          cssName: fontName.toLowerCase(),
          cat: 'local',
          weights: [400, 700]
        };
        setCustomFonts(prev => [newEntry, ...prev]);
        handleFontSelect(newEntry);
      });
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">Font Family</h3>
        <span className="text-[11px] font-mono text-mute">
          {filteredFonts.length} / {allFonts.length}
        </span>
      </div>

      {/* Search & Upload */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-mute" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search fonts…"
            className="w-full pl-8 pr-2.5 py-1 text-xs text-ink bg-surface-2 rounded-lg border border-line focus:border-line-strong outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 text-mute hover:text-ink bg-surface-2 hover:bg-surface-3 border border-line rounded-lg transition-colors"
          title="Upload .ttf, .otf, .woff file"
        >
          <Upload size={13} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept=".ttf,.otf,.woff,.woff2"
          className="hidden"
          onChange={handleUploadFont}
        />
      </div>

      {/* Font listbox */}
      <div className="flex flex-col gap-1 max-h-44 overflow-y-auto pr-1 rounded-lg border border-line bg-surface-2/40 p-1">
        {filteredFonts.map(font => {
          const isSelected = font.name === selectedFont;
          return (
            <button
              key={font.name}
              type="button"
              onClick={() => handleFontSelect(font)}
              onMouseEnter={() => loadFont(font.name)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
                isSelected
                  ? 'bg-surface-4 text-ink font-semibold border border-line-strong'
                  : 'text-body hover:bg-surface-3 hover:text-ink'
              }`}
            >
              <span className="text-xs truncate">{font.name}</span>
              <span
                className="text-xs text-mute/80 shrink-0"
                style={{ fontFamily: `"${font.name}", sans-serif` }}
              >
                Aa Ag
              </span>
            </button>
          );
        })}
      </div>

      {/* Weight Selector */}
      {activeEntry && activeEntry.weights.length > 1 && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-mute">Weight</span>
          <div className="flex items-center gap-1">
            {activeEntry.weights.map(w => (
              <button
                key={w}
                type="button"
                onClick={() => onWeightChange(String(w))}
                className={`px-2 py-0.5 text-xs font-mono rounded transition-colors ${
                  String(w) === selectedWeight
                    ? 'bg-ink text-canvas font-bold'
                    : 'bg-surface-3 text-mute hover:text-ink'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
