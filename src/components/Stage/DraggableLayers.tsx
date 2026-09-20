import React, { useRef, useState, useEffect } from 'react';
import { useStudio } from '../../state/useStudioStore';
import { fontStackOf } from '../../engine/canvas2d/layerRenderer';
import { clamp } from '../../engine/colors/colorMath';

interface DraggableLayersProps {
  frameRef: React.RefObject<HTMLDivElement | null>;
}

interface DragState {
  index: number;
  startClientX: number;
  startClientY: number;
  startLayerX: number;
  startLayerY: number;
  currentX: number;
  currentY: number;
}

export const DraggableLayers: React.FC<DraggableLayersProps> = ({ frameRef }) => {
  const { config, updateConfig, updateLayer, configRef } = useStudio();
  const dragState = useRef<DragState | null>(null);
  const layerBoxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [frameWidth, setFrameWidth] = useState(800);
  const [, setRerender] = useState(0);

  // Track frame container width for proportional layer bounding boxes
  useEffect(() => {
    const updateSize = () => {
      if (frameRef.current) {
        setFrameWidth(frameRef.current.getBoundingClientRect().width);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [frameRef]);

  const k = (frameWidth || 800) / 1600;

  const handlePointerDown = (index: number, e: React.PointerEvent<HTMLDivElement>) => {
    const layer = config.layers[index];
    if (!layer || layer.visible === false || layer.lock) return;

    e.preventDefault();
    e.stopPropagation();

    // Select this layer as active in the studio
    if (config.act !== index) {
      updateConfig({ act: index });
    }

    const currentX = typeof layer.x === 'number' ? layer.x : 50;
    const currentY = typeof layer.y === 'number' ? layer.y : 50;

    dragState.current = {
      index,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startLayerX: currentX,
      startLayerY: currentY,
      currentX,
      currentY
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handlePointerMove = (index: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current || dragState.current.index !== index || !frameRef.current) return;

    e.preventDefault();
    e.stopPropagation();

    const rect = frameRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const dx = ((e.clientX - dragState.current.startClientX) / rect.width) * 100;
    const dy = ((e.clientY - dragState.current.startClientY) / rect.height) * 100;

    // Allow natural bleeding slightly off canvas edges (-15% to 115%)
    const newX = Math.round(clamp(dragState.current.startLayerX + dx, -15, 115) * 10) / 10;
    const newY = Math.round(clamp(dragState.current.startLayerY + dy, -15, 115) * 10) / 10;

    dragState.current.currentX = newX;
    dragState.current.currentY = newY;

    // 1. Update mutable ref immediately so WebGL / 2D Canvas render loop renders layer at 60 FPS
    if (configRef.current.layers && configRef.current.layers[index]) {
      configRef.current.layers[index].x = newX;
      configRef.current.layers[index].y = newY;
    }

    // 2. Directly update DOM position for instantaneous zero-latency feedback
    const boxEl = layerBoxRefs.current[index];
    if (boxEl) {
      boxEl.style.left = `${newX}%`;
      boxEl.style.top = `${newY}%`;
    }
  };

  const handlePointerUp = (index: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (dragState.current && dragState.current.index === index) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {}

      const finalX = dragState.current.currentX;
      const finalY = dragState.current.currentY;
      dragState.current = null;

      // Commit finalized position into studio store state
      updateLayer(index, { x: finalX, y: finalY });
      setRerender(n => n + 1);
    }
  };

  if (!config.layers || config.layers.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-[8]">
      {config.layers.map((layer, idx) => {
        if (layer.visible === false) return null;

        const isSelected = config.act === idx;
        const xPos = typeof layer.x === 'number' ? layer.x : 50;
        const yPos = typeof layer.y === 'number' ? layer.y : 50;
        const rot = layer.rot || 0;

        // Determine layer bounding dimensions based on kind
        let innerContent: React.ReactNode = null;

        if (layer.kind === 'text') {
          const fontSize = Math.max(12, (layer.textSize || 100) * k);
          const lh = layer.lineH && layer.lineH > 0 ? layer.lineH : 1.18;
          const sp = (layer.sp || 0) * k;

          innerContent = (
            <div
              className="px-2 py-1 select-none pointer-events-none whitespace-pre opacity-0 leading-tight"
              style={{
                fontSize: `${fontSize}px`,
                fontFamily: fontStackOf(layer.textFont || 'Inter'),
                fontWeight: layer.textWeight || 400,
                lineHeight: lh,
                letterSpacing: `${sp}px`,
                textAlign: layer.textAlign || 'center',
                minWidth: '60px',
                minHeight: '28px'
              }}
            >
              {layer.textValue || 'Text Layer'}
            </div>
          );
        } else {
          // Shape or Image
          const long = Math.max(36, (layer.imgLen || 360) * k);
          const nw = layer.img?.naturalWidth || 1;
          const nh = layer.img?.naturalHeight || 1;
          const w = nw >= nh ? long : (long * nw) / nh;
          const h = nw >= nh ? (long * nh) / nw : long;

          innerContent = (
            <div
              className="select-none pointer-events-none"
              style={{
                width: `${Math.round(w)}px`,
                height: `${Math.round(h)}px`,
                minWidth: '40px',
                minHeight: '40px'
              }}
            />
          );
        }

        return (
          <div
            key={idx}
            ref={el => { layerBoxRefs.current[idx] = el; }}
            onPointerDown={e => handlePointerDown(idx, e)}
            onPointerMove={e => handlePointerMove(idx, e)}
            onPointerUp={e => handlePointerUp(idx, e)}
            onPointerCancel={e => handlePointerUp(idx, e)}
            style={{
              left: `${xPos}%`,
              top: `${yPos}%`,
              transform: `translate(-50%, -50%) rotate(${rot}deg)`
            }}
            className={`absolute pointer-events-auto touch-none transition-all duration-75 group ${
              layer.lock
                ? 'cursor-not-allowed opacity-60'
                : 'cursor-grab active:cursor-grabbing'
            }`}
            title={layer.lock ? `${layer.name || 'Layer'} (Locked)` : `Drag to move ${layer.name || 'Layer'}`}
          >
            {/* Interactive Bounding Frame */}
            <div
              className={`relative rounded transition-all duration-150 ${
                isSelected
                  ? 'border-2 border-cyan-400/90 shadow-[0_0_15px_rgba(34,211,238,0.35)]'
                  : 'border border-dashed border-white/30 hover:border-white/70 hover:bg-white/[0.03]'
              }`}
            >
              {innerContent}

              {/* Selection Handles & Identifier Pill (Visible for Active Layer) */}
              {isSelected && (
                <>
                  {/* Layer Identifier Tag */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#0b0d12]/95 border border-cyan-400/60 shadow-lg flex items-center gap-1 text-[9.5px] font-mono text-cyan-300 whitespace-nowrap pointer-events-none uppercase tracking-wider select-none">
                    <span>{layer.kind === 'text' ? 'T' : (layer.kind === 'shape' || (layer as any).kind === 'img' || layer.shapeIdx != null || !!layer.shapeFill) ? '★' : 'IMG'}</span>
                    <span className="max-w-[120px] truncate">{layer.name || 'Active Layer'}</span>
                  </div>

                  {/* Corner Anchor Handles */}
                  <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border border-cyan-500 rounded-[2px] shadow-sm pointer-events-none" />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border border-cyan-500 rounded-[2px] shadow-sm pointer-events-none" />
                  <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border border-cyan-500 rounded-[2px] shadow-sm pointer-events-none" />
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border border-cyan-500 rounded-[2px] shadow-sm pointer-events-none" />
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
