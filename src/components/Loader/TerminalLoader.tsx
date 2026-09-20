import React, { useState, useEffect, useCallback } from 'react';
import { Terminal, CheckCircle2, FolderGit2, X } from 'lucide-react';
import { prewarmPresets } from '../../services/presetPrewarmer';

interface TerminalLoaderProps {
  mode?: 'boot' | 'preview';
  onComplete?: () => void;
}

interface LogLine {
  id: number;
  time: string;
  prefix: string;
  text: string;
  status: 'OK' | 'CACHED' | 'MOUNTED' | 'READY' | 'ONLINE';
}

const BOOT_LOGS: Omit<LogLine, 'id'>[] = [
  { time: '0.04s', prefix: 'init', text: 'WebGL 2.0 multi-pass shader engine', status: 'OK' },
  { time: '0.19s', prefix: 'cache', text: 'Indexing 381 uiGradients & 63 studio presets', status: 'CACHED' },
  { time: '0.36s', prefix: 'shapes', text: 'Mounting 72 SVG vector geometry polyhedra', status: 'MOUNTED' },
  { time: '0.55s', prefix: 'fonts', text: 'Priming Google typography & font glyph vectors', status: 'READY' },
  { time: '0.74s', prefix: 'curves', text: 'Calibrating cubic Bezier gradient field & HDR profile', status: 'ONLINE' },
  { time: '0.92s', prefix: 'system', text: 'Gradiopak Studio v2.0 boot sequence complete', status: 'READY' },
];

export const TerminalLoader: React.FC<TerminalLoaderProps> = ({ mode = 'boot', onComplete }) => {
  const isPreview = mode === 'preview';

  const [logs, setLogs] = useState<LogLine[]>(() =>
    isPreview ? BOOT_LOGS.map((item, id) => ({ ...item, id })) : []
  );
  const [progress, setProgress] = useState(() => (isPreview ? 100 : 0));
  const [isExiting, setIsExiting] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const finish = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsDismissed(true);
      if (onComplete) onComplete();
    }, 450);
  }, [onComplete]);

  // Start background pre-baking of preset thumbnails immediately
  useEffect(() => {
    prewarmPresets();
  }, []);

  // Terminal boot execution sequence (only if mode === 'boot')
  useEffect(() => {
    if (isPreview) return;

    let currentStep = 0;
    const stepDuration = 220;

    const interval = setInterval(() => {
      if (currentStep < BOOT_LOGS.length) {
        const item = BOOT_LOGS[currentStep];
        setLogs(prev => [...prev, { ...item, id: currentStep }]);
        setProgress(Math.round(((currentStep + 1) / BOOT_LOGS.length) * 100));
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(finish, 400);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [isPreview, finish]);

  // Allow clicking anywhere or pressing any key to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || !isPreview) {
        finish();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPreview, finish]);

  if (isDismissed) return null;

  // Build text-based progress bar: [██████████░░░░░░░░] 50%
  const totalBlocks = 24;
  const filledBlocks = Math.round((progress / 100) * totalBlocks);
  const progressBarStr = '█'.repeat(filledBlocks) + '░'.repeat(Math.max(0, totalBlocks - filledBlocks));

  return (
    <div
      onClick={finish}
      className={`fixed inset-0 z-[100] bg-[#08090c] flex items-center justify-center p-3 sm:p-6 overflow-hidden select-none cursor-pointer transition-all duration-500 ${isExiting ? 'opacity-0 scale-[0.98] pointer-events-none' : 'opacity-100 scale-100'
        }`}
      role="dialog"
      aria-label="Studio Initialization Terminal"
    >
      {/* Dynamic Background Ambient Atmosphere */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-[#ff5e62]/30 to-[#ff9966]/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-tl from-[#57c1ff]/30 to-[#8b6bae]/20 blur-3xl" />
      </div>

      {/* Terminal Window Frame */}
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#0d0e14]/95 border border-line-strong rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(87,193,255,0.08)] backdrop-blur-2xl overflow-hidden flex flex-col font-mono text-xs cursor-default"
      >
        {/* Title Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#12141c] border-b border-line shrink-0">
          {/* Traffic light window controls */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-sm inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-sm inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] shadow-sm inline-block" />
          </div>

          {/* Location / Repository Path */}
          <div className="flex items-center gap-1.5 text-xs text-mute font-mono tracking-wide px-2 py-0.5 rounded-md bg-surface-2/60 border border-line-soft">
            <FolderGit2 size={12} className="text-accent-blue shrink-0" />
            <span className="text-ink font-semibold">wasiffalishah</span>
            <span className="text-stone">/</span>
            <span className="text-accent-yellow">gradiopak</span>
          </div>

          {/* Close Button on Right of Title Bar */}
          <button
            type="button"
            onClick={finish}
            className="p-1 rounded-md text-mute hover:text-ink hover:bg-surface-3 transition-colors"
            title="Close Terminal (Esc)"
          >
            <X size={15} />
          </button>
        </div>

        {/* Terminal Screen Body */}
        <div className="p-4 sm:p-6 flex flex-col gap-4 text-left overflow-x-hidden">
          {/* Hero Branding Header Banner with Static Clean Logo */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2/60 border border-line/80">
            <div className="flex items-center gap-3">
              {/* Static Gradiopak Logo (no rotation) */}
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-line-strong shadow-lg shrink-0">
                <img
                  src="/og-share.png"
                  alt="Gradiopak Logo"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-ink">
                    GRADIOPAK
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-accent-blue/15 text-accent-blue border border-accent-blue/30 font-semibold">
                    v2.0.0
                  </span>
                </div>
                <span className="text-[11px] text-mute font-mono">
                  Multi-Pass WebGL Gradient Studio
                </span>
              </div>
            </div>

            {/* Live FPS / Engine Spec */}
            <div className="hidden sm:flex flex-col items-end text-[10px] text-mute font-mono">
              <span className="text-accent-green font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-ping" />
                60 FPS WebGL
              </span>
              <span>100% Client-Side</span>
            </div>
          </div>

          {/* Command Prompt Line */}
          <div className="flex items-center gap-2 text-mute text-xs pt-1">
            <span className="text-accent-green font-bold">➜</span>
            <span className="text-accent-blue font-semibold">wasiffalishah/gradiopak</span>
            <span className="text-stone">on</span>
            <span className="text-accent-yellow font-medium">main [⇡]</span>
            <span className="text-mute">$</span>
            <span className="text-ink font-semibold">npm run load --presets --shaders</span>
          </div>

          {/* Step-by-Step Boot Logs */}
          <div className="flex flex-col gap-1.5 min-h-[140px] text-[11px] sm:text-xs">
            {logs.map(log => (
              <div
                key={log.id}
                className="flex items-center justify-between gap-2 text-mute animate-fade-in"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-stone font-mono select-none hidden sm:inline">[{log.time}]</span>
                  <span className="text-accent-blue font-bold">➜</span>
                  <span className="text-stone font-semibold">[{log.prefix}]</span>
                  <span className="text-body truncate">{log.text}</span>
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-accent-green" />
                  <span className="text-[10px] font-bold text-accent-green tracking-wider">
                    {log.status}
                  </span>
                </div>
              </div>
            ))}

            {/* Active Blinking Cursor on In-Progress Line */}
            {progress < 100 && (
              <div className="flex items-center gap-2 text-stone text-[11px] pt-1">
                <span className="text-accent-blue animate-pulse">➜</span>
                <span className="text-mute italic">compiling graphics shaders...</span>
                <span className="inline-block w-2 h-3.5 bg-ink animate-pulse" />
              </div>
            )}
          </div>

          {/* ASCII Progress Bar & Status Meter */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-line/60 text-xs">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-mute flex items-center gap-1.5">
                <Terminal size={12} className="text-accent-blue" />
                <span>Status:</span>
                <span className="text-ink font-semibold">
                  {progress >= 100 ? 'System Ready' : 'Loading Assets & Shaders...'}
                </span>
              </span>
              <span className="font-bold text-accent-green">{progress}%</span>
            </div>

            {/* Responsive text progress meter */}
            <div className="text-accent-blue tracking-wider font-mono text-xs overflow-x-hidden select-none">
              [{progressBarStr}]
            </div>
          </div>

          {/* Close / Skip Action */}
          <div className="flex items-center justify-between pt-1 text-[10.5px] text-stone">
            <span className="hover:text-mute transition-colors cursor-pointer" onClick={finish}>
              {isPreview ? 'Click anywhere or tap ✕ to close →' : 'Press any key or tap anywhere to launch →'}
            </span>
            <span className="font-mono text-[10px] text-mute">ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
