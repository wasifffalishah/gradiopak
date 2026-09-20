import React, { useEffect, useRef, useState } from 'react';
import { useStudio } from '../../state/useStudioStore';
import { createWebGLRenderer, WebGLStudioRenderer } from '../../engine/webgl/glRenderer';
import { render2D } from '../../engine/canvas2d/fallbackRenderer';
import { drawLayers } from '../../engine/canvas2d/layerRenderer';
import { DraggableSpots } from './DraggableSpots';
import { DraggableLayers } from './DraggableLayers';
import { CurveOverlay } from './CurveOverlay';
import { StageToolbar } from './StageToolbar';
import { CompareBox } from './CompareBox';
import { PaletteBand } from './PaletteBand';
import { X } from 'lucide-react';

export const CanvasStage: React.FC = () => {
  const { config, configRef, isFullscreen, setIsFullscreen } = useStudio();
  const frameRef = useRef<HTMLDivElement>(null);
  const glCanvasRef = useRef<HTMLCanvasElement>(null);
  const txtCanvasRef = useRef<HTMLCanvasElement>(null);
  const fsCanvasRef = useRef<HTMLCanvasElement>(null);

  const rendererRef = useRef<WebGLStudioRenderer | null>(null);
  const fsRendererRef = useRef<WebGLStudioRenderer | null>(null);

  // Aspect ratio calculation
  const getAspectRatioStyle = () => {
    if (config.ratio === 'custom' && config.custW && config.custH) {
      return `${config.custW} / ${config.custH}`;
    }
    return config.ratio.replace('/', ' / ');
  };

  const getAspectRatioNumber = () => {
    if (config.ratio === 'custom' && config.custW && config.custH) {
      return (config.custW || 1600) / (config.custH || 900);
    }
    const parts = (config.ratio || '16/9').split('/').map(Number);
    const w = parts[0] || 16;
    const h = parts[1] || 9;
    return w / h;
  };

  // 60 FPS Render Loop decoupled from React
  useEffect(() => {
    const glCanvas = glCanvasRef.current;
    const txtCanvas = txtCanvasRef.current;
    if (!glCanvas || !txtCanvas) return;

    if (!rendererRef.current) {
      rendererRef.current = createWebGLRenderer(glCanvas);
    }

    let rafId = 0;
    let lastTime = performance.now();
    let accumulatedTime = 0;

    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const currentCfg = configRef.current;
      if (currentCfg.animate) {
        accumulatedTime += dt * (currentCfg.speed / 100);
      }

      // Check canvas dimensions against frame
      if (frameRef.current) {
        const rect = frameRef.current.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.max(2, Math.round(rect.width * dpr));
        const h = Math.max(2, Math.round(rect.height * dpr));

        if (glCanvas.width !== w || glCanvas.height !== h) {
          glCanvas.width = w;
          glCanvas.height = h;
        }
        if (txtCanvas.width !== w || txtCanvas.height !== h) {
          txtCanvas.width = w;
          txtCanvas.height = h;
        }

        // 1. Render WebGL background
        if (rendererRef.current) {
          rendererRef.current.render(currentCfg, w, h, accumulatedTime);
        } else {
          render2D(glCanvas, currentCfg, w, h);
        }

        // 2. Render 2D Layer Stack (text, fonts, 3D depth, shapes)
        const ctx2d = txtCanvas.getContext('2d');
        if (ctx2d) {
          ctx2d.clearRect(0, 0, w, h);
          drawLayers(ctx2d, currentCfg.layers, w, h, w / 1600, false, now);
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [configRef]);

  // Fullscreen Render Loop
  useEffect(() => {
    if (!isFullscreen || !fsCanvasRef.current) return;
    const fsCanvas = fsCanvasRef.current;
    if (!fsRendererRef.current) {
      fsRendererRef.current = createWebGLRenderer(fsCanvas);
    }

    let rafId = 0;
    let lastTime = performance.now();
    let t = 0;

    const fsTick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      const currentCfg = configRef.current;
      if (currentCfg.animate) {
        t += dt * (currentCfg.speed / 100);
      }

      const w = window.innerWidth;
      const h = window.innerHeight;
      if (fsCanvas.width !== w || fsCanvas.height !== h) {
        fsCanvas.width = w;
        fsCanvas.height = h;
      }

      if (fsRendererRef.current) {
        fsRendererRef.current.render(currentCfg, w, h, t);
      }
      rafId = requestAnimationFrame(fsTick);
    };

    rafId = requestAnimationFrame(fsTick);
    return () => cancelAnimationFrame(rafId);
  }, [isFullscreen, configRef]);

  return (
    <div className="flex flex-col flex-1 min-h-0 justify-start lg:justify-between lg:h-full p-0 sm:p-1 lg:p-0 gap-2.5 sm:gap-3 lg:gap-4 overflow-visible lg:overflow-y-auto no-scrollbar">
      {/* Compare Box if pinned */}
      <CompareBox />

      {/* Center Stage Card & Canvas Frame */}
      <div className="flex flex-col items-center justify-center w-full py-1 px-1.5 sm:p-2 lg:p-4 rounded-xl sm:rounded-2xl bg-panel border border-line shadow-2xl lg:flex-1 lg:min-h-[300px]">
        <div
          id="stageCanvas"
          ref={frameRef}
          style={{
            aspectRatio: getAspectRatioStyle(),
            width: `min(100%, calc(68vh * ${getAspectRatioNumber()}))`,
            maxHeight: '70vh'
          }}
          className="relative mx-auto rounded-xl overflow-hidden shadow-2xl border border-line bg-canvas group"
        >
          {/* WebGL Canvas */}
          <canvas
            ref={glCanvasRef}
            className="absolute inset-0 w-full h-full object-cover"
            role="img"
            aria-label="Gradient preview"
          />

          {/* 2D Layers Overlay */}
          <canvas
            ref={txtCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-[5]"
            aria-hidden="true"
          />

          {/* Interactive Draggable Layers Overlay */}
          <DraggableLayers frameRef={frameRef} />

          {/* Draggable Color Origin Rings */}
          <DraggableSpots frameRef={frameRef} />

          {/* Curve Shaping Graph Overlay & Canvas Left-Side Toggle */}
          <CurveOverlay />
        </div>
      </div>

      {/* Palette Color Band */}
      <PaletteBand />

      {/* Stage Foot: Meta info, Actions, and Status */}
      <StageToolbar />

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <canvas ref={fsCanvasRef} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all shadow-2xl"
            title="Exit fullscreen (Esc)"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
};
