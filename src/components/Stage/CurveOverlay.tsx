import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useStudio } from '../../state/useStudioStore';
import { evalCurve, PointTV } from '../../engine/curves/curveMath';
import { clamp } from '../../engine/colors/colorMath';

export const CurveOverlay: React.FC = () => {
  const { config, updateConfig, configRef, setStatus } = useStudio();
  const [activeAxis, setActiveAxis] = useState<'x' | 'y'>('x');

  const canvasXRef = useRef<HTMLCanvasElement>(null);
  const canvasYRef = useRef<HTMLCanvasElement>(null);
  const dragInfoRef = useRef<{ axis: 'x' | 'y'; index: number } | null>(null);

  const isCurveOn = !!config.curve.on;

  // Convert points format safely
  const getPoints = useCallback((axis: 'x' | 'y'): PointTV[] => {
    const raw = axis === 'x' ? configRef.current.curve.xPts : configRef.current.curve.yPts;
    if (!Array.isArray(raw) || raw.length < 2) {
      return [{ t: 0, v: 0 }, { t: 1, v: 1 }];
    }
    return raw.map(p => ({
      t: clamp(Number(p.x !== undefined ? p.x : (p as any).t) || 0, 0, 1),
      v: clamp(Number(p.y !== undefined ? p.y : (p as any).v) || 0, 0, 1)
    })).sort((a, b) => a.t - b.t);
  }, [configRef]);

  // Render a specific curve axis onto its 2D canvas
  const drawAxis = useCallback((axis: 'x' | 'y') => {
    const canvas = axis === 'x' ? canvasXRef.current : canvasYRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (!rect || rect.width < 10 || rect.height < 10) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = rect.width;
    const h = rect.height;
    const bw = Math.max(2, Math.round(w * dpr));
    const bh = Math.max(2, Math.round(h * dpr));

    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const isH = axis === 'x';
    const isActive = activeAxis === axis;
    const pts = getPoints(axis);
    const smooth = configRef.current.curve.smooth !== false;

    const toScreenX = (p: PointTV) => (isH ? p.t * w : p.v * w);
    const toScreenY = (p: PointTV) => (isH ? (1 - p.v) * h : (1 - p.t) * h);

    // 1. Subtle Grid lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      if (isH) {
        ctx.moveTo((w * i) / 4, 0);
        ctx.lineTo((w * i) / 4, h);
      } else {
        ctx.moveTo(0, (h * i) / 4);
        ctx.lineTo(w, (h * i) / 4);
      }
      ctx.stroke();
    }

    // Midline
    ctx.beginPath();
    if (isH) {
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
    } else {
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
    }
    ctx.stroke();

    // 2. Sampled Curve Spline
    const samples = 72;
    ctx.beginPath();
    for (let i = 0; i <= samples; i++) {
      const tt = i / samples;
      const v = evalCurve(pts, smooth, tt);
      const px = toScreenX({ t: tt, v });
      const py = toScreenY({ t: tt, v });
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }

    // Shading under curve
    if (isActive) {
      ctx.shadowColor = 'rgba(255, 255, 255, 0.35)';
      ctx.shadowBlur = 6;
    }
    ctx.strokeStyle = isActive ? '#f4f5f7' : '#8e919b';
    ctx.lineWidth = isActive ? 2.2 : 1.2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Fill under curve
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = isActive ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)';
    ctx.fill();

    // 3. Control points
    pts.forEach((p, i) => {
      let px = toScreenX(p);
      let py = toScreenY(p);
      const isEnd = i === 0 || i === pts.length - 1;
      if (isEnd) {
        px = clamp(px, 4, w - 4);
        py = clamp(py, 4, h - 4);
      }

      ctx.beginPath();
      if (isEnd) {
        const s = 4.5;
        ctx.rect(px - s, py - s, s * 2, s * 2);
      } else {
        ctx.arc(px, py, 4.2, 0, Math.PI * 2);
      }
      ctx.fillStyle = '#f4f5f7';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(7, 8, 11, 0.85)';
      ctx.stroke();
    });
  }, [activeAxis, getPoints, configRef]);

  // Redraw whenever curve or axis changes
  useEffect(() => {
    if (isCurveOn) {
      drawAxis('x');
      drawAxis('y');
    }
  }, [isCurveOn, activeAxis, config.curve, drawAxis]);

  // Pointer Interaction Handler for a Curve Canvas
  const handlePointerDown = (axis: 'x' | 'y', e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const isH = axis === 'x';
    setActiveAxis(axis);

    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((e.clientY - rect.top) / rect.height, 0, 1);
    const tv: PointTV = { t: isH ? x : 1 - y, v: isH ? 1 - y : x };

    const pts = getPoints(axis);
    const sx = (p: PointTV) => (isH ? p.t * rect.width : p.v * rect.width);
    const sy = (p: PointTV) => (isH ? (1 - p.v) * rect.height : (1 - p.t) * rect.height);

    // Check if clicked near an existing point (within 16px)
    let bestIdx = -1;
    let bestDist = 16;
    pts.forEach((p, i) => {
      const dx = sx(p) - (e.clientX - rect.left);
      const dy = sy(p) - (e.clientY - rect.top);
      const dist = Math.hypot(dx, dy);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    });

    if (bestIdx >= 0) {
      // Drag existing point
      dragInfoRef.current = { axis, index: bestIdx };
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch (err) {}
      return;
    }

    // Add new point if not too close to neighbors (min 0.02 distance)
    let j = 1;
    while (j < pts.length - 1 && pts[j].t < tv.t) j++;
    const prev = pts[j - 1];
    const next = pts[j];

    // Minimum distance threshold to prevent polynomial oscillation / shake!
    if (!prev || !next || tv.t - prev.t < 0.02 || next.t - tv.t < 0.02) return;

    const nextPts = [...pts];
    nextPts.splice(j, 0, { t: tv.t, v: tv.v });

    // Update configRef and state
    const converted = nextPts.map(p => ({ x: p.t, y: p.v }));
    if (axis === 'x') {
      configRef.current.curve.xPts = converted;
      updateConfig(prevCfg => ({ ...prevCfg, curve: { ...prevCfg.curve, xPts: converted } }));
    } else {
      configRef.current.curve.yPts = converted;
      updateConfig(prevCfg => ({ ...prevCfg, curve: { ...prevCfg.curve, yPts: converted } }));
    }

    dragInfoRef.current = { axis, index: j };
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (err) {}
    setStatus('Curve point added.');
  };

  const handlePointerMove = (axis: 'x' | 'y', e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragInfoRef.current;
    if (!drag || drag.axis !== axis) return;

    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const isH = axis === 'x';

    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((e.clientY - rect.top) / rect.height, 0, 1);
    const tv: PointTV = { t: isH ? x : 1 - y, v: isH ? 1 - y : x };

    const pts = getPoints(axis);
    const idx = drag.index;
    const isEnd = idx === 0 || idx === pts.length - 1;

    // Strict boundary constraints prevent points from collapsing or reversing
    const lo = idx > 0 ? pts[idx - 1].t + 0.02 : 0;
    const hi = idx < pts.length - 1 ? pts[idx + 1].t - 0.02 : 1;

    pts[idx] = {
      t: isEnd ? pts[idx].t : clamp(Math.round(tv.t * 1000) / 1000, lo, hi),
      v: clamp(Math.round(tv.v * 1000) / 1000, 0, 1)
    };

    const converted = pts.map(p => ({ x: p.t, y: p.v }));
    if (axis === 'x') {
      configRef.current.curve.xPts = converted;
    } else {
      configRef.current.curve.yPts = converted;
    }

    // Redraw at 60fps immediately without full React tree re-render
    drawAxis(axis);
  };

  const handlePointerUp = (axis: 'x' | 'y', e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragInfoRef.current;
    if (drag && drag.axis === axis) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {}
      dragInfoRef.current = null;

      // Commit final points to state on pointer release
      const currentPts = getPoints(axis).map(p => ({ x: p.t, y: p.v }));
      if (axis === 'x') {
        updateConfig(prev => ({ ...prev, curve: { ...prev.curve, xPts: currentPts } }));
      } else {
        updateConfig(prev => ({ ...prev, curve: { ...prev.curve, yPts: currentPts } }));
      }
    }
  };

  const handleContextMenu = (axis: 'x' | 'y', e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const isH = axis === 'x';
    const pts = getPoints(axis);

    const sx = (p: PointTV) => (isH ? p.t * rect.width : p.v * rect.width);
    const sy = (p: PointTV) => (isH ? (1 - p.v) * rect.height : (1 - p.t) * rect.height);

    let hitIdx = -1;
    let bestDist = 16;
    pts.forEach((p, i) => {
      const dx = sx(p) - (e.clientX - rect.left);
      const dy = sy(p) - (e.clientY - rect.top);
      const dist = Math.hypot(dx, dy);
      if (dist < bestDist) {
        bestDist = dist;
        hitIdx = i;
      }
    });

    if (hitIdx > 0 && hitIdx < pts.length - 1) {
      if (pts.length <= 2) {
        setStatus('Curves need at least two points — the ends stay pinned.');
        return;
      }
      const nextPts = pts.filter((_, i) => i !== hitIdx);
      const converted = nextPts.map(p => ({ x: p.t, y: p.v }));
      if (axis === 'x') {
        configRef.current.curve.xPts = converted;
        updateConfig(prev => ({ ...prev, curve: { ...prev.curve, xPts: converted } }));
      } else {
        configRef.current.curve.yPts = converted;
        updateConfig(prev => ({ ...prev, curve: { ...prev.curve, yPts: converted } }));
      }
      setStatus('Curve point removed.');
    }
  };

  return (
    <>
      {/* Floating Canvas Mode Toggle on the Left Side */}
      <div id="curveSpotsToggle" className="absolute top-3 left-3 z-30 flex items-center gap-1 bg-[#0a0b0e]/90 border border-line rounded-full p-1 shadow-2xl backdrop-blur-md select-none">
        <button
          type="button"
          onClick={() => {
            updateConfig(prev => ({ ...prev, curve: { ...prev.curve, on: false } }));
            setStatus('Spots mode: drag origin rings to position colors.');
          }}
          className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-150 ${
            !isCurveOn
              ? 'bg-[#f4f5f7] text-[#0a0b0e] shadow-sm'
              : 'text-mute hover:text-ink hover:bg-white/5'
          }`}
          title="Color origin spots mode"
        >
          Spots
        </button>
        <button
          type="button"
          onClick={() => {
            updateConfig(prev => ({ ...prev, curve: { ...prev.curve, on: true } }));
            setStatus('Curve mode: bend graphs on canvas to warp the gradient.');
          }}
          className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-150 ${
            isCurveOn
              ? 'bg-[#f4f5f7] text-[#0a0b0e] shadow-sm'
              : 'text-mute hover:text-ink hover:bg-white/5'
          }`}
          title="X / Y transfer curve warping mode"
        >
          Curves
        </button>
      </div>

      {/* Floating Curve Controls Bar on the Top-Right (when Curves is active) */}
      {isCurveOn && (
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1 bg-[#0a0b0e]/90 border border-line rounded-full p-1 shadow-2xl backdrop-blur-md select-none animate-fade-in">
          <button
            type="button"
            onClick={() => setActiveAxis('x')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all duration-150 ${
              activeAxis === 'x'
                ? 'bg-[#f4f5f7] text-[#0a0b0e] shadow-sm'
                : 'text-mute hover:text-ink hover:bg-white/5'
            }`}
          >
            X Axis
          </button>
          <button
            type="button"
            onClick={() => setActiveAxis('y')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all duration-150 ${
              activeAxis === 'y'
                ? 'bg-[#f4f5f7] text-[#0a0b0e] shadow-sm'
                : 'text-mute hover:text-ink hover:bg-white/5'
            }`}
          >
            Y Axis
          </button>
          <button
            type="button"
            onClick={() =>
              updateConfig(prev => ({
                ...prev,
                curve: { ...prev.curve, smooth: !prev.curve.smooth }
              }))
            }
            className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-all duration-150 ${
              config.curve.smooth
                ? 'bg-surface-3 text-ink border-line-strong'
                : 'border-transparent text-mute hover:text-ink hover:bg-white/5'
            }`}
          >
            {config.curve.smooth ? 'Smooth' : 'Linear'}
          </button>
        </div>
      )}

      {/* Dual Curve Graph Overlays on Canvas Edges (Original Gradiopak Signature Layout) */}
      {isCurveOn && (
        <>
          {/* X Curve Overlay on Bottom Edge */}
          <div
            className={`absolute left-20 right-3 bottom-3 h-[68px] z-20 rounded-xl overflow-hidden bg-[#0a0b0e]/85 border backdrop-blur-md shadow-2xl transition-all duration-150 ${
              activeAxis === 'x'
                ? 'border-white/50 ring-1 ring-white/20'
                : 'border-line opacity-50 hover:opacity-80'
            }`}
          >
            <span className="absolute top-1.5 left-2 pointer-events-none font-mono text-[9px] font-semibold uppercase tracking-widest text-[#8e919b]">
              X Axis
            </span>
            <canvas
              ref={canvasXRef}
              onPointerDown={e => handlePointerDown('x', e)}
              onPointerMove={e => handlePointerMove('x', e)}
              onPointerUp={e => handlePointerUp('x', e)}
              onPointerCancel={e => handlePointerUp('x', e)}
              onContextMenu={e => handleContextMenu('x', e)}
              onDoubleClick={e => handleContextMenu('x', e as any)}
              className="w-full h-full block cursor-crosshair touch-none"
              title="Click to add point, drag to bend, right-click to remove"
            />
          </div>

          {/* Y Curve Overlay on Left Edge */}
          <div
            className={`absolute left-3 top-14 bottom-22 w-[68px] z-20 rounded-xl overflow-hidden bg-[#0a0b0e]/85 border backdrop-blur-md shadow-2xl transition-all duration-150 ${
              activeAxis === 'y'
                ? 'border-white/50 ring-1 ring-white/20'
                : 'border-line opacity-50 hover:opacity-80'
            }`}
          >
            <span className="absolute top-1.5 left-2 pointer-events-none font-mono text-[9px] font-semibold uppercase tracking-widest text-[#8e919b]">
              Y Axis
            </span>
            <canvas
              ref={canvasYRef}
              onPointerDown={e => handlePointerDown('y', e)}
              onPointerMove={e => handlePointerMove('y', e)}
              onPointerUp={e => handlePointerUp('y', e)}
              onPointerCancel={e => handlePointerUp('y', e)}
              onContextMenu={e => handleContextMenu('y', e)}
              onDoubleClick={e => handleContextMenu('y', e as any)}
              className="w-full h-full block cursor-crosshair touch-none"
              title="Click to add point, drag to bend, right-click to remove"
            />
          </div>
        </>
      )}
    </>
  );
};
