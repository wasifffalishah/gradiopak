import React, { useRef } from 'react';
import { useStudio } from '../../../state/useStudioStore';
import { SHAPES } from '../../../constants/shapes';
import { Slider } from '../Controls/Slider';
import { FontSelector } from '../Controls/FontSelector';
import { Layer } from '../../../types';
import { layerGeom } from '../../../engine/canvas2d/layerRenderer';
import { colorName, outSize } from '../../../engine/colors/colorMath';
import { Plus, Trash2, Eye, EyeOff, Lock, Unlock, Image as ImageIcon, Type, Shapes, RotateCw } from 'lucide-react';

export const LayersTab: React.FC = () => {
  const { config, updateConfig, addLayer, updateLayer, removeLayer, setStatus } = useStudio();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeLayerIndex = Math.max(0, Math.min(config.act, config.layers.length - 1));
  const activeLayer: Layer | undefined = config.layers[activeLayerIndex];

  const isShapeLayerItem = (l?: Layer | null) => {
    if (!l) return false;
    return (
      l.kind === 'shape' ||
      (l as any).kind === 'img' ||
      l.shapeIdx != null ||
      !!l.shapeFill ||
      !!(l as any).fill ||
      (typeof l.imgSrc === 'string' && (l.imgSrc.includes('/shapes/') || l.imgSrc.endsWith('.svg') || l.imgSrc.startsWith('data:image/svg+xml')))
    );
  };

  const isShapeActive = !!(activeLayer && isShapeLayerItem(activeLayer));
  const currentShapeFill = (activeLayer?.shapeFill || (activeLayer as any)?.fill || '#FFFFFF').toUpperCase();
  const validPickerHex = /^#[0-9A-F]{6}$/i.test(currentShapeFill) ? currentShapeFill : '#FFFFFF';
  const paletteColors = Array.from(new Set(['#FFFFFF', '#000000', ...config.colors.map(c => c.toUpperCase())])).slice(0, 10);

  const handleUpdateShapeColor = (newColor: string) => {
    updateLayer(activeLayerIndex, {
      shapeFill: newColor,
      fill: newColor,
      kind: 'shape'
    } as any);
  };

  const handleAddText = () => {
    const num = config.layers.length + 1;
    const newL: Layer = {
      id: `text-${Date.now()}`,
      kind: 'text',
      name: `Text ${num}`,
      textValue: 'Gradiopak',
      textColor: '#FFFFFF',
      textSize: 90,
      textWeight: '400',
      textFont: 'Instrument Serif',
      textAlign: 'center',
      textShadow: true,
      x: 50,
      y: 50,
      rot: 0,
      blend: 'source-over',
      depth: 0,
      depthColor: '#000000',
      imgLen: 360,
      opacity: 1,
      visible: true,
      lock: false,
      lineH: 1.18,
      sp: 0,
      flipH: false,
      flipV: false,
      animType: 'none',
      animDur: 1.5,
      animDelay: 0,
      animLoop: true,
      animCount: 0,
      animDir: 'left',
      animEase: 'linear',
      animOrigin: 'center'
    };
    addLayer(newL);
    setStatus(`Added text layer: ${newL.name}`);
  };

  const handleAddShape = (shapeId: number) => {
    const shapeMeta = SHAPES.find(s => s.id === shapeId);
    if (!shapeMeta) return;

    const img = new Image();
    img.src = shapeMeta.path;
    img.onload = () => {
      const num = config.layers.length + 1;
      const newL: Layer = {
        id: `shape-${Date.now()}`,
        kind: 'shape',
        name: `Shape ${shapeId}`,
        textValue: '',
        textColor: '#FFFFFF',
        textSize: 100,
        textWeight: '400',
        textFont: 'Inter',
        textAlign: 'center',
        textShadow: false,
        x: 50,
        y: 50,
        rot: 0,
        blend: 'source-over',
        depth: 0,
        depthColor: '#000000',
        img,
        imgSrc: shapeMeta.path,
        imgLen: 240,
        opacity: 0.9,
        visible: true,
        lock: false,
        lineH: 1.18,
        sp: 0,
        flipH: false,
        flipV: false,
        shapeIdx: shapeId - 1,
        shapeFill: '#FFFFFF',
        fill: '#FFFFFF',
        animType: 'none',
        animDur: 1.5,
        animDelay: 0,
        animLoop: true,
        animCount: 0,
        animDir: 'left',
        animEase: 'linear',
        animOrigin: 'center'
      };
      addLayer(newL);
      setStatus(`Added vector shape: Shape ${shapeId}`);
    };
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      const num = config.layers.length + 1;
      const newL: Layer = {
        id: `img-${Date.now()}`,
        kind: 'image',
        name: file.name.slice(0, 20),
        textValue: '',
        textColor: '#FFFFFF',
        textSize: 100,
        textWeight: '400',
        textFont: 'Inter',
        textAlign: 'center',
        textShadow: false,
        x: 50,
        y: 50,
        rot: 0,
        blend: 'source-over',
        depth: 0,
        depthColor: '#000000',
        img,
        imgSrc: url,
        imgLen: 320,
        opacity: 1,
        visible: true,
        lock: false,
        lineH: 1.18,
        sp: 0,
        flipH: false,
        flipV: false,
        animType: 'none',
        animDur: 1.5,
        animDelay: 0,
        animLoop: true,
        animCount: 0,
        animDir: 'left',
        animEase: 'linear',
        animOrigin: 'center'
      };
      addLayer(newL);
      setStatus(`Added image layer: ${newL.name}`);
    };
  };

  const handleAlignToCanvas = (alignment: 'left' | 'center' | 'right') => {
    if (!activeLayer) return;
    const s = outSize(config.ratio, config.custW, config.custH);
    const g = layerGeom(activeLayer, s.w, s.h, 1);
    const pad = Math.max(30, Math.round(s.w * 0.05));
    let newX = 50;
    if (alignment === 'left') {
      newX = Math.max(2, Math.min(95, Math.round(((pad + g.w / 2) / s.w) * 1000) / 10));
    } else if (alignment === 'center') {
      newX = 50;
    } else if (alignment === 'right') {
      newX = Math.max(5, Math.min(98, Math.round(((s.w - pad - g.w / 2) / s.w) * 1000) / 10));
    }
    updateLayer(activeLayerIndex, {
      x: newX,
      ...(activeLayer.kind === 'text' ? { textAlign: alignment } : {})
    });
    setStatus(`Aligned layer to ${alignment}`);
  };

  return (
    <div id="secLayers" className="flex flex-col gap-6 p-4">
      {/* Layers Header & Buttons */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">Layers Stack</h3>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleAddText}
              className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-mute hover:text-ink hover:bg-surface-3 rounded transition-colors"
            >
              <Type size={12} />
              <span>+ Text</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-mute hover:text-ink hover:bg-surface-3 rounded transition-colors"
            >
              <ImageIcon size={12} />
              <span>+ Image</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleUploadImage}
            />
          </div>
        </div>

        {/* Layer list pills */}
        <div className="flex flex-col gap-1.5">
          {config.layers.map((layer, idx) => {
            const isSelected = idx === activeLayerIndex;
            return (
              <div
                key={layer.id || idx}
                onClick={() => updateConfig({ act: idx })}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border transition-colors ${
                  isSelected
                    ? 'bg-surface-3 border-line-strong'
                    : 'bg-surface-2/60 border-line hover:border-line-strong'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {layer.kind === 'text' ? (
                    <Type size={14} className="text-mute shrink-0" />
                  ) : isShapeLayerItem(layer) ? (
                    <Shapes size={14} className="text-mute shrink-0" />
                  ) : (
                    <ImageIcon size={14} className="text-mute shrink-0" />
                  )}
                  <span className="text-xs font-medium text-ink truncate">
                    {layer.name || `Layer ${idx + 1}`}
                  </span>
                  {(isShapeLayerItem(layer) || layer.kind === 'text') && (
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-line-strong shrink-0 shadow-sm ml-1"
                      style={{
                        backgroundColor:
                          isShapeLayerItem(layer)
                            ? (layer.shapeFill || (layer as any).fill || '#FFFFFF')
                            : (layer.textColor || '#FFFFFF')
                      }}
                      title={`Color: ${isShapeLayerItem(layer) ? (layer.shapeFill || (layer as any).fill || '#FFFFFF') : (layer.textColor || '#FFFFFF')}`}
                    />
                  )}
                </div>

                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => updateLayer(idx, { visible: !layer.visible })}
                    className="p-1 text-mute hover:text-ink transition-colors"
                    title={layer.visible ? 'Hide' : 'Show'}
                  >
                    {layer.visible ? <Eye size={13} /> : <EyeOff size={13} className="text-ash" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateLayer(idx, { lock: !layer.lock })}
                    className="p-1 text-mute hover:text-ink transition-colors"
                    title={layer.lock ? 'Unlock' : 'Lock'}
                  >
                    {layer.lock ? <Lock size={13} className="text-accent-yellow" /> : <Unlock size={13} />}
                  </button>
                  {config.layers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLayer(idx)}
                      className="p-1 text-mute hover:text-accent-red transition-colors"
                      title="Delete layer"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Active Layer Editor */}
      {activeLayer && (
        <>
          {activeLayer.kind === 'text' && (
            <section className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">Typography</h3>
              <textarea
                rows={2}
                value={activeLayer.textValue}
                onChange={e => updateLayer(activeLayerIndex, { textValue: e.target.value })}
                placeholder="Enter text (line breaks supported)"
                className="w-full p-2.5 text-xs text-ink bg-surface-2 rounded-lg border border-line focus:border-line-strong outline-none"
              />

              <FontSelector
                selectedFont={activeLayer.textFont}
                selectedWeight={activeLayer.textWeight}
                onFontChange={textFont => updateLayer(activeLayerIndex, { textFont })}
                onWeightChange={textWeight => updateLayer(activeLayerIndex, { textWeight })}
              />

              {/* Text Color */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-mute font-medium">Text Color</span>
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-surface-2/60 border border-line hover:border-line-strong transition-colors">
                  <label className="relative w-7 h-7 rounded-md overflow-hidden border border-line-strong shrink-0 shadow-inner cursor-pointer" title="Pick text color">
                    <input
                      type="color"
                      value={activeLayer.textColor || '#FFFFFF'}
                      onChange={e => updateLayer(activeLayerIndex, { textColor: e.target.value.toUpperCase() })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full h-full pointer-events-none" style={{ backgroundColor: activeLayer.textColor || '#FFFFFF' }} />
                  </label>

                  <input
                    type="text"
                    maxLength={7}
                    value={activeLayer.textColor || '#FFFFFF'}
                    onChange={e => {
                      let v = e.target.value.toUpperCase();
                      if (!v.startsWith('#')) v = '#' + v;
                      updateLayer(activeLayerIndex, { textColor: v });
                    }}
                    className="w-20 px-2 py-0.5 text-xs font-mono text-ink bg-surface-3 rounded border border-transparent focus:border-line-strong outline-none uppercase"
                  />

                  <span className="text-[11px] font-mono text-mute truncate flex-1">
                    {colorName(activeLayer.textColor || '#FFFFFF')}
                  </span>
                </div>

                {/* Quick Palette Swatches */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="text-[11px] text-mute mr-0.5">Palette:</span>
                  {['#FFFFFF', '#000000', ...config.colors].slice(0, 8).map((c, i) => {
                    const isSelected = (activeLayer.textColor || '#FFFFFF').toUpperCase() === c.toUpperCase();
                    return (
                      <button
                        key={`${c}-${i}`}
                        type="button"
                        onClick={() => updateLayer(activeLayerIndex, { textColor: c.toUpperCase() })}
                        className={`w-5 h-5 rounded-md border transition-transform hover:scale-110 shrink-0 ${
                          isSelected
                            ? 'border-white shadow-sm ring-1 ring-white/60'
                            : 'border-line hover:border-line-strong'
                        }`}
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {isShapeActive && activeLayer && (
            <section className="flex flex-col gap-2.5">
              <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">Shape Style</h3>

              {/* Shape Color */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-mute font-medium">Shape Color</span>
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-surface-2/60 border border-line hover:border-line-strong transition-colors">
                  <label className="relative w-7 h-7 rounded-md overflow-hidden border border-line-strong shrink-0 shadow-inner cursor-pointer" title="Pick shape color">
                    <input
                      type="color"
                      value={validPickerHex}
                      onChange={e => handleUpdateShapeColor(e.target.value.toUpperCase())}
                      onInput={e => handleUpdateShapeColor((e.target as HTMLInputElement).value.toUpperCase())}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full h-full pointer-events-none" style={{ backgroundColor: currentShapeFill }} />
                  </label>

                  <input
                    type="text"
                    maxLength={7}
                    value={currentShapeFill}
                    onChange={e => {
                      let v = e.target.value.toUpperCase();
                      if (!v.startsWith('#')) v = '#' + v;
                      handleUpdateShapeColor(v);
                    }}
                    onBlur={e => {
                      let v = e.target.value.trim().toUpperCase();
                      if (!v.startsWith('#')) v = '#' + v;
                      if (!/^#[0-9A-F]{6}$/i.test(v) && !/^#[0-9A-F]{3}$/i.test(v)) {
                        v = '#FFFFFF';
                      }
                      handleUpdateShapeColor(v);
                    }}
                    className="w-20 px-2 py-0.5 text-xs font-mono text-ink bg-surface-3 rounded border border-transparent focus:border-line-strong outline-none uppercase"
                  />

                  <span className="text-[11px] font-mono text-mute truncate flex-1">
                    {colorName(currentShapeFill)}
                  </span>
                </div>

                {/* Quick Palette Swatches */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="text-[11px] text-mute mr-0.5">Palette:</span>
                  {paletteColors.map((c, i) => {
                    const isSelected = currentShapeFill === c.toUpperCase();
                    return (
                      <button
                        key={`${c}-${i}`}
                        type="button"
                        onClick={() => handleUpdateShapeColor(c.toUpperCase())}
                        className={`w-5 h-5 rounded-md border transition-transform hover:scale-110 shrink-0 ${
                          isSelected
                            ? 'border-white shadow-sm ring-1 ring-white/60'
                            : 'border-line hover:border-line-strong'
                        }`}
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Transform & Positioning */}
          <section id="secTransform" className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">Transform</h3>
            
            {/* Align (Left, Center, Right) */}
            <div className="flex items-center justify-between text-xs py-1 px-1.5 bg-surface-2 rounded-lg border border-line">
              <span className="text-mute font-medium pl-1">Align</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleAlignToCanvas('left')}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-surface-3 text-mute hover:text-ink hover:bg-surface-4 transition-colors"
                  title="Align left"
                >
                  Left
                </button>
                <button
                  type="button"
                  onClick={() => handleAlignToCanvas('center')}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-surface-3 text-mute hover:text-ink hover:bg-surface-4 transition-colors"
                  title="Align center"
                >
                  Center
                </button>
                <button
                  type="button"
                  onClick={() => handleAlignToCanvas('right')}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-surface-3 text-mute hover:text-ink hover:bg-surface-4 transition-colors"
                  title="Align right"
                >
                  Right
                </button>
              </div>
            </div>

            {/* Letter Spacing & Line Height: Only visible when active layer is Text */}
            {activeLayer.kind === 'text' && (
              <div className="flex flex-col gap-2 pt-1">
                <Slider
                  label="Letter Spacing"
                  value={activeLayer.sp || 0}
                  min={0}
                  max={60}
                  formatValue={v => `${v}px`}
                  onChange={sp => updateLayer(activeLayerIndex, { sp })}
                />
                <Slider
                  label="Line Height"
                  value={Math.round((activeLayer.lineH || 1.18) * 100)}
                  min={50}
                  max={300}
                  formatValue={v => `${(v / 100).toFixed(2)}`}
                  onChange={v => updateLayer(activeLayerIndex, { lineH: v / 100 })}
                />
              </div>
            )}

            <Slider
              label="X Position"
              value={activeLayer.x}
              min={0}
              max={100}
              formatValue={v => `${v}%`}
              onChange={x => updateLayer(activeLayerIndex, { x })}
            />
            <Slider
              label="Y Position"
              value={activeLayer.y}
              min={0}
              max={100}
              formatValue={v => `${v}%`}
              onChange={y => updateLayer(activeLayerIndex, { y })}
            />
            <Slider
              label="Rotation"
              value={activeLayer.rot}
              min={-180}
              max={180}
              formatValue={v => `${v}°`}
              onChange={rot => updateLayer(activeLayerIndex, { rot })}
            />
            <Slider
              label={activeLayer.kind === 'text' ? 'Font Size' : 'Scale / Size'}
              value={activeLayer.kind === 'text' ? activeLayer.textSize : activeLayer.imgLen}
              min={activeLayer.kind === 'text' ? 12 : 40}
              max={activeLayer.kind === 'text' ? 360 : 1200}
              formatValue={v => `${v}px`}
              onChange={val =>
                updateLayer(
                  activeLayerIndex,
                  activeLayer.kind === 'text' ? { textSize: val } : { imgLen: val }
                )
              }
            />
            <Slider
              label="Opacity"
              value={Math.round(activeLayer.opacity * 100)}
              min={0}
              max={100}
              formatValue={v => `${v}%`}
              onChange={v => updateLayer(activeLayerIndex, { opacity: v / 100 })}
            />
            <Slider
              label="3D Depth Extrusion"
              value={activeLayer.depth}
              min={0}
              max={100}
              formatValue={v => `${v}%`}
              onChange={depth => updateLayer(activeLayerIndex, { depth })}
            />
          </section>

          {/* Animation Controls */}
          <section id="secAnimation" className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">Layer Animation</h3>
              <span className="text-[11px] font-mono text-mute">
                {activeLayer.animType && activeLayer.animType !== 'none' ? activeLayer.animType.toUpperCase() : 'NONE'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={activeLayer.animType || 'none'}
                onChange={e => updateLayer(activeLayerIndex, { animType: e.target.value as any, _astart: performance.now() })}
                className="w-full px-2.5 py-1.5 text-xs text-ink bg-surface-2 rounded-lg border border-line focus:border-line-strong outline-none"
              >
                <option value="none">None</option>
                <option value="fadein">Fade In</option>
                <option value="fadeout">Fade Out</option>
                <option value="fadeio">Fade In + Out</option>
                <option value="spin">Spin Rotate</option>
                <option value="flicker">Flicker</option>
                <option value="pulse">Scale Pulse</option>
                <option value="slide">Slide In & Out</option>
              </select>

              {activeLayer.animType && activeLayer.animType !== 'none' ? (
                <select
                  value={activeLayer.animEase || 'linear'}
                  onChange={e => updateLayer(activeLayerIndex, { animEase: e.target.value as any, _astart: performance.now() })}
                  className="w-full px-2.5 py-1.5 text-xs text-ink bg-surface-2 rounded-lg border border-line focus:border-line-strong outline-none"
                >
                  <option value="linear">Linear</option>
                  <option value="easein">Ease In</option>
                  <option value="easeout">Ease Out</option>
                  <option value="easeio">Ease In-Out</option>
                </select>
              ) : (
                <div className="w-full px-2.5 py-1.5 text-xs text-mute/50 bg-surface-2/40 rounded-lg border border-line/40 select-none">
                  Static (No motion)
                </div>
              )}
            </div>

            {activeLayer.animType && activeLayer.animType !== 'none' && (
              <>
                {/* Slide Direction */}
                {activeLayer.animType === 'slide' && (
                  <div className="flex flex-col gap-1.5 pt-0.5">
                    <span className="text-xs text-mute font-medium">Slide Direction</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'left', label: '← Left to Right' },
                        { id: 'right', label: 'Right to Left →' },
                        { id: 'top', label: '↓ Top to Bottom' },
                        { id: 'bottom', label: 'Bottom to Top ↑' }
                      ].map(dir => (
                        <button
                          key={dir.id}
                          type="button"
                          onClick={() => updateLayer(activeLayerIndex, { animDir: dir.id as any, _astart: performance.now() })}
                          className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                            (activeLayer.animDir || 'left') === dir.id
                              ? 'bg-surface-4 text-ink border-line-strong shadow-sm font-semibold'
                              : 'bg-surface-2 text-mute border-line hover:text-ink hover:bg-surface-3'
                          }`}
                        >
                          {dir.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pulse Origin / Axis */}
                {activeLayer.animType === 'pulse' && (
                  <div className="flex flex-col gap-1.5 pt-0.5">
                    <span className="text-xs text-mute font-medium">Pulse Axis</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'center', label: 'Center' },
                        { id: 'left', label: 'Left' },
                        { id: 'right', label: 'Right' }
                      ].map(orig => (
                        <button
                          key={orig.id}
                          type="button"
                          onClick={() => updateLayer(activeLayerIndex, { animOrigin: orig.id as any, _astart: performance.now() })}
                          className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                            (activeLayer.animOrigin || 'center') === orig.id
                              ? 'bg-surface-4 text-ink border-line-strong shadow-sm font-semibold'
                              : 'bg-surface-2 text-mute border-line hover:text-ink hover:bg-surface-3'
                          }`}
                        >
                          {orig.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Duration Slider */}
                <Slider
                  label="Duration"
                  value={activeLayer.animDur || 1.5}
                  min={0.2}
                  max={10}
                  step={0.1}
                  formatValue={v => `${v.toFixed(1)}s`}
                  onChange={animDur => updateLayer(activeLayerIndex, { animDur, _astart: performance.now() })}
                />

                {/* Delay Slider */}
                <Slider
                  label="Delay"
                  value={activeLayer.animDelay || 0}
                  min={0}
                  max={10}
                  step={0.1}
                  formatValue={v => `${v.toFixed(1)}s`}
                  onChange={animDelay => updateLayer(activeLayerIndex, { animDelay, _astart: performance.now() })}
                />

                {/* Looping & Repeat Count */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-surface-2/60 border border-line">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={activeLayer.animLoop !== false}
                      onChange={e => updateLayer(activeLayerIndex, { animLoop: e.target.checked, _astart: performance.now() })}
                      className="rounded border-line text-cyan-500 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-ink">Loop</span>
                  </label>

                  {activeLayer.animLoop !== false && (
                    <div className="flex items-center gap-2.5">
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!activeLayer.animCount || activeLayer.animCount === 0}
                          onChange={e => updateLayer(activeLayerIndex, {
                            animCount: e.target.checked ? 0 : 1,
                            _astart: performance.now()
                          })}
                          className="rounded border-line text-cyan-500 focus:ring-0 cursor-pointer"
                        />
                        <span className="text-[11px] text-mute">Infinite</span>
                      </label>

                      {Boolean(activeLayer.animCount && activeLayer.animCount > 0) && (
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-mute">Count:</span>
                          <input
                            type="number"
                            min={1}
                            max={999}
                            value={activeLayer.animCount || 1}
                            onChange={e => updateLayer(activeLayerIndex, {
                              animCount: Math.max(1, parseInt(e.target.value) || 1),
                              _astart: performance.now()
                            })}
                            className="w-12 px-1.5 py-0.5 text-xs font-mono text-ink bg-surface-3 rounded border border-line outline-none text-center"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Replay Animation Trigger */}
                <button
                  type="button"
                  onClick={() => updateLayer(activeLayerIndex, { _astart: performance.now() })}
                  className="w-full py-1.5 px-3 text-xs font-medium text-mute hover:text-ink bg-surface-2 hover:bg-surface-3 rounded-lg border border-line transition-colors flex items-center justify-center gap-1.5"
                  title="Restart animation from beginning"
                >
                  <RotateCw size={12} />
                  <span>Restart Animation</span>
                </button>
              </>
            )}
          </section>
        </>
      )}

      {/* 72 SVG Shape Library Rack */}
      <section id="secShapeLib" className="flex flex-col gap-2 pt-2 border-t border-line">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">
            Shape Library ({SHAPES.length})
          </h3>
          <span className="text-[11px] text-mute">Click to add as layer</span>
        </div>
        <div className="grid grid-cols-4 gap-2 p-1 bg-surface-2/40 rounded-xl border border-line">
          {SHAPES.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleAddShape(s.id)}
              className="flex items-center justify-center p-2 rounded-lg bg-surface-2 hover:bg-surface-3 border border-line hover:border-line-strong group transition-all"
              title={s.name}
            >
              <img
                src={s.path}
                alt={s.name}
                className="w-7 h-7 object-contain opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all filter invert"
              />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
