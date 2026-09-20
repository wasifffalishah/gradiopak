import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStudio, TabType } from '../../state/useStudioStore';
import { Sparkles, X, ChevronLeft, ChevronRight, Rocket } from 'lucide-react';

export interface TourStep {
  num: number;
  target: string;
  tab: TabType;
  title: string;
  desc: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    num: 1,
    target: '#secRatio',
    tab: 'design',
    title: 'Aspect Ratio & Custom Canvas Dimensions',
    desc: 'Set your canvas proportions: choose standard 16:9 widescreen, 1:1 square, 9:16 mobile story, 4:5 vertical, ultra-wide 21:9, or input custom pixel widths and heights.'
  },
  {
    num: 2,
    target: '#secShape',
    tab: 'design',
    title: '15 Shader Algorithms & Mathematical Shapes',
    desc: 'Select from 15 distinct algorithms: fluid vortices (Flow), polar Auroras, rolling Skyscapes, 3D draped Silk, organic Mesh, Light Blades, and geometric classics like Conic, Diamond, and Radial.'
  },
  {
    num: 3,
    target: '#secGenre',
    tab: 'design',
    title: '8 Surface Materials & Stylistic Color Finishes',
    desc: 'Transform your palette instantly: apply glistening Metallic, liquid Chrome, Iridescent oil slick, holographic pearlescence, vibrant Neon glow, pastel softness, or two-tone Duotone.'
  },
  {
    num: 4,
    target: '#secPalette',
    tab: 'design',
    title: 'Palette Colors & Image Palette Extractor',
    desc: 'Add, remove, and fine-tune up to 8 live color stops with color pickers and hex inputs. Click "Image" to upload any photo and extract an instant harmonious 5-color palette.'
  },
  {
    num: 5,
    target: '#curveSpotsToggle',
    tab: 'design',
    title: 'Spots & Curves Mode Toggle',
    desc: 'A powerhouse feature right on the canvas! Switch between "Spots" (interactive draggable color coordinates) and "Curves" (bending X and Y spline transfer curves on canvas edges to stretch and fold color dimensions).'
  },
  {
    num: 6,
    target: '#secDynamics',
    tab: 'design',
    title: 'Field Dynamics & Surface Textures',
    desc: 'Dial in motion speed, scale, and noise warp distortion. Apply 10 physical tactile textures like film grain, frosted glass, wave ripple, scanlines, and paper.'
  },
  {
    num: 7,
    target: '#secPresets',
    tab: 'presets',
    title: 'Presets & uiGradients Library',
    desc: 'Explore 63 handcrafted presets with Japanese poetic translations plus the built-in offline library of 381 uiGradients palettes across neon, pastel, metallic, and duotone.'
  },
  {
    num: 8,
    target: '#secLayers',
    tab: 'text',
    title: 'Layers: Text & Custom Media',
    desc: 'Build rich multi-layer compositions on top of your live gradient canvas! Click "+ Text" to insert typography with 90+ Google fonts, or "+ Image" to place custom graphics with drag-and-drop ordering.'
  },
  {
    num: 9,
    target: '#secTransform',
    tab: 'text',
    title: 'Layer Transform & 3D Depth',
    desc: 'Manipulate any layer with precision: align to canvas (Left, Center, Right), drag directly on screen, rotate, resize, adjust letter spacing and line height, or add physical 3D extrusion depth.'
  },
  {
    num: 10,
    target: '#secAnimation',
    tab: 'text',
    title: 'Per-Layer Keyframe Animations',
    desc: 'Bring text, shapes, and images to life! Choose from Fade in/out, Spin (rotate), Flicker, Scale pulse, or Slide in with 4 customizable slide directions (left, right, top, bottom), duration, and easing.'
  },
  {
    num: 11,
    target: '#secShapeLib',
    tab: 'text',
    title: 'Curated SVG Vector Shapes',
    desc: 'Enrich your visual design with 72 curated vector shapes: geometric polyhedrons, abstract badges, stars, bursts, and framing elements. Click any shape to add it as an independent canvas layer.'
  },
  {
    num: 12,
    target: '#secExport',
    tab: 'export',
    title: 'Multi-Format Export & Live CSS',
    desc: 'Export in every format: high-res PNG, JPEG, WebP images, animated looping MP4/WebM videos with custom duration, 1200×630 social preview cards, shareable URLs, and copyable CSS background code.'
  },
  {
    num: 13,
    target: '#stageActions',
    tab: 'design',
    title: 'Stage Tools & A/B Compare',
    desc: 'Quick tools right under the canvas: instant palette shuffle, pin your design for A/B split comparison while experimenting, run the screensaver Preset Reel, and enter distraction-free Fullscreen mode.'
  }
];

interface TourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TourModal: React.FC<TourModalProps> = ({ isOpen, onClose }) => {
  const { setActiveTab, setStatus } = useStudio();
  const [curStep, setCurStep] = useState(0);

  // Spotlight coordinates
  const [spotPos, setSpotPos] = useState<{ top: number; left: number; width: number; height: number }>({
    top: 0,
    left: 0,
    width: 0,
    height: 0
  });

  // Tour card coordinates
  const [cardPos, setCardPos] = useState<{ top: number; left: number }>({
    top: 100,
    left: 100
  });

  const [hasSpotlight, setHasSpotlight] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const step = TOUR_STEPS[curStep];

  const updatePositions = useCallback(() => {
    if (!step) return;

    let el = document.querySelector(step.target) as HTMLElement | null;
    if (!el || el.offsetParent === null) {
      el = document.querySelector('#stageCanvas') || document.body;
    }
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const pad = 8;
    const sTop = Math.max(0, rect.top - pad);
    const sLeft = Math.max(0, rect.left - pad);
    const sW = rect.width + pad * 2;
    const sH = rect.height + pad * 2;

    setSpotPos({
      top: sTop,
      left: sLeft,
      width: sW,
      height: sH
    });
    setHasSpotlight(true);

    // Calculate Card Position
    const cardEl = cardRef.current;
    const cardW = 390;
    const cardH = cardEl ? cardEl.offsetHeight : 240;

    let cLeft: number;
    let cTop: number;

    const winW = window.innerWidth;
    const winH = window.innerHeight;

    if (winW <= 768) {
      // On mobile / small tablet, place card away from target so it never covers it
      cLeft = Math.max(12, (winW - cardW) / 2);
      if (rect.top > winH * 0.45) {
        cTop = Math.max(16, rect.top - cardH - 16);
      } else {
        cTop = Math.min(winH - cardH - 16, rect.bottom + 16);
      }
    } else if (step.target.includes('curveSpotsToggle')) {
      // Anchored below the canvas Spots & Curves toggle
      cLeft = rect.left;
      cTop = rect.bottom + 16;
    } else if (rect.right < winW * 0.52) {
      // Target in left sidebar: anchor card immediately to its right
      cLeft = rect.right + 20;
      cTop = rect.top + rect.height / 2 - cardH / 2;
    } else if (step.target.includes('stageActions') || step.target.includes('stageToolbar')) {
      // Step 13: #stageActions is located at the bottom-right of the canvas toolbar.
      // Anchor the card comfortably to the LEFT of #stageActions with generous clearance,
      // so the action buttons are completely visible and never covered by the card!
      cLeft = rect.left - cardW - 24;
      cTop = Math.min(rect.bottom - cardH, winH - cardH - 16);
      // Fallback if not enough space on the left (narrow screens)
      if (cLeft < 20) {
        cLeft = Math.max(16, (winW - cardW) / 2);
        cTop = Math.max(16, rect.top - cardH - 24);
      }
    } else {
      // On or inside stage canvas
      cLeft = rect.left + 28;
      cTop = rect.top + 28;
    }

    // Viewport bounds clamp
    cLeft = Math.max(16, Math.min(winW - cardW - 16, cLeft));
    cTop = Math.max(16, Math.min(winH - cardH - 16, cTop));

    setCardPos({ top: cTop, left: cLeft });
  }, [step]);

  // When step changes, switch tab, scroll to element, and track position
  useEffect(() => {
    if (!isOpen || !step) return;

    // 1. Switch tab
    setActiveTab(step.tab);

    // 2. Allow DOM to render tab pane, then scroll & track
    const timeout = setTimeout(() => {
      let el = document.querySelector(step.target) as HTMLElement | null;
      if (!el) el = document.querySelector('#stageCanvas');

      if (el) {
        const palettePane = document.querySelector('.palette-pane');
        if (palettePane && palettePane.contains(el)) {
          const palRect = palettePane.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();
          const delta = elRect.top - (palRect.top + 16);
          palettePane.scrollTo({
            top: Math.max(0, palettePane.scrollTop + delta),
            behavior: 'smooth'
          });
        } else {
          // Check if element is already comfortably visible in viewport before scrolling
          const elRect = el.getBoundingClientRect();
          const isFullyVisible =
            elRect.top >= 20 &&
            elRect.bottom <= window.innerHeight - 20 &&
            elRect.left >= 0 &&
            elRect.right <= window.innerWidth;

          if (!isFullyVisible) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }

      // Smooth tracking loop during scroll
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const startTime = performance.now();
      const duration = 650;

      const track = () => {
        updatePositions();
        if (performance.now() - startTime < duration) {
          rafRef.current = requestAnimationFrame(track);
        }
      };
      rafRef.current = requestAnimationFrame(track);
    }, 60);

    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isOpen, curStep, step, setActiveTab, updatePositions]);

  // Window resize & scroll listeners
  useEffect(() => {
    if (!isOpen) return;

    const onScrollOrResize = () => updatePositions();
    window.addEventListener('resize', onScrollOrResize, { passive: true });
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    const palettePane = document.querySelector('.palette-pane');
    if (palettePane) palettePane.addEventListener('scroll', onScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('scroll', onScrollOrResize);
      if (palettePane) palettePane.removeEventListener('scroll', onScrollOrResize);
    };
  }, [isOpen, updatePositions]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        setCurStep(c => Math.min(TOUR_STEPS.length - 1, c + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurStep(c => Math.max(0, c - 1));
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || (typeof window !== 'undefined' && window.innerWidth < 640)) return null;

  const handleNext = () => {
    if (curStep < TOUR_STEPS.length - 1) {
      setCurStep(curStep + 1);
    } else {
      onClose();
      setStatus('Tour finished — enjoy Gradiopak!');
    }
  };

  const handlePrev = () => {
    if (curStep > 0) setCurStep(curStep - 1);
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none select-none">
      {/* Clickable transparent backdrop - fully transparent when spotlight is active so spotlight colors remain 100% vibrant and natural */}
      <div
        className={`fixed inset-0 pointer-events-auto transition-opacity duration-300 ${
          hasSpotlight ? 'bg-transparent' : 'bg-black/75'
        }`}
        onClick={onClose}
      />

      {/* Spotlight cutout surrounding the targeted feature */}
      {hasSpotlight && (
        <div
          style={{
            top: `${spotPos.top}px`,
            left: `${spotPos.left}px`,
            width: `${spotPos.width}px`,
            height: `${spotPos.height}px`
          }}
          className="fixed pointer-events-none z-[10000] rounded-xl transition-all duration-200 ease-out border-2 border-white/90 shadow-[0_0_0_9999px_rgba(3,4,7,0.82),0_0_24px_rgba(255,255,255,0.25)]"
        >
          {/* Subtle glowing pulse ring */}
          <div className="absolute -inset-1.5 rounded-2xl border border-white/40 animate-pulse pointer-events-none" />
        </div>
      )}

      {/* Floating Anchored Tour Card */}
      <div
        ref={cardRef}
        style={{
          top: `${cardPos.top}px`,
          left: `${cardPos.left}px`,
          width: 'min(400px, calc(100vw - 32px))'
        }}
        className="fixed z-[10001] pointer-events-auto flex flex-col gap-3.5 p-5 bg-[#0e1016]/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.95)] transition-all duration-200 ease-out animate-in fade-in zoom-in-95"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-accent-yellow animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-mute">
              STEP {String(curStep + 1).padStart(2, '0')} / {String(TOUR_STEPS.length).padStart(2, '0')}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-mute hover:text-ink hover:bg-surface-3 rounded-lg transition-colors"
            title="Close tour (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Card Body */}
        <div className="flex flex-col gap-1.5">
          <h3 className="text-sm font-bold text-ink leading-snug">{step.title}</h3>
          <p className="text-xs text-body leading-relaxed">{step.desc}</p>
        </div>

        {/* Step Number Pills */}
        <div className="flex items-center justify-center gap-1 py-1 flex-wrap">
          {TOUR_STEPS.map((s, idx) => {
            const isActive = idx === curStep;
            const isDone = idx < curStep;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setCurStep(idx)}
                className={`w-5 h-5 rounded-full text-[10px] font-mono flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-ink text-canvas font-bold scale-110 shadow-sm'
                    : isDone
                    ? 'bg-surface-3 text-body border border-line-strong hover:text-ink'
                    : 'bg-surface-2 text-mute border border-line hover:text-ink'
                }`}
                title={`Step ${s.num}: ${s.title}`}
              >
                {s.num}
              </button>
            );
          })}
        </div>

        {/* Card Footer Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-line/80">
          <button
            type="button"
            disabled={curStep === 0}
            onClick={handlePrev}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-mute hover:text-ink disabled:opacity-30 disabled:pointer-events-none rounded-lg hover:bg-surface-3 transition-all"
          >
            <ChevronLeft size={14} />
            <span>Back</span>
          </button>

          <span className="text-[10px] font-mono text-ash hidden sm:inline">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-3 border border-line">←</kbd>{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-surface-3 border border-line">→</kbd>
          </span>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-ink text-canvas rounded-lg hover:opacity-95 shadow-sm transition-opacity"
          >
            {curStep === TOUR_STEPS.length - 1 ? (
              <>
                <span>Finish</span>
                <Rocket size={13} />
              </>
            ) : (
              <>
                <span>Next</span>
                <ChevronRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
