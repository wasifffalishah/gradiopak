import { GradientConfig } from '../types';
import { outSize } from '../engine/colors/colorMath';
import { blitTo } from '../engine/webgl/glRenderer';
import { drawLayers } from '../engine/canvas2d/layerRenderer';
import { drawCredit } from './imageExporter';

export interface QualityProfile {
  longEdge: number;
  fps: number;
  bps: number;
  label: string;
}

export const QUALITY_PROFILES: Record<string, QualityProfile> = {
  '2k60': { longEdge: 2560, fps: 60, bps: 28_000_000, label: '2K • 60fps' },
  '1080p60': { longEdge: 1920, fps: 60, bps: 18_000_000, label: '1080p • 60fps' },
  '1080p30': { longEdge: 1920, fps: 30, bps: 14_000_000, label: '1080p • 30fps' },
  '720p60': { longEdge: 1280, fps: 60, bps: 10_000_000, label: '720p • 60fps' },
  '720p30': { longEdge: 1280, fps: 30, bps: 6_000_000, label: '720p • 30fps' }
};

export interface ActiveVideoJob {
  stopEarly: () => void;
}

export function exportMP4Video(
  cfg: GradientConfig,
  durationSecs: number,
  qualityKey: string,
  onProgress?: (msg: string) => void,
  onComplete?: () => void
): ActiveVideoJob | null {
  const profile = QUALITY_PROFILES[qualityKey] || QUALITY_PROFILES['1080p60'];
  const rParts = (cfg.ratio || '16/9').split('/').map(Number);
  const rw = rParts[0] > 0 ? rParts[0] : 16;
  const rh = rParts[1] > 0 ? rParts[1] : 9;

  let W: number, H: number;
  if (rw >= rh) {
    W = profile.longEdge;
    H = Math.round((W * rh) / rw);
  } else {
    H = profile.longEdge;
    W = Math.round((H * rw) / rh);
  }
  if (W % 2 !== 0) W -= 1;
  if (H % 2 !== 0) H -= 1;

  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d');
  if (!ctx) {
    if (onProgress) onProgress('Unable to initialize canvas context for export.');
    return null;
  }

  const stream = (cv as any).captureStream ? (cv as any).captureStream(profile.fps) : null;
  if (!stream) {
    if (onProgress) onProgress('Canvas capture stream is not supported in this browser.');
    return null;
  }

  const cand = [
    'video/mp4;codecs=avc1.640028',
    'video/mp4;codecs=avc1',
    'video/mp4',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm'
  ];
  const mime = cand.find(m => window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m));

  let rec: MediaRecorder;
  const recOpts: any = { videoBitsPerSecond: profile.bps };
  if (mime) recOpts.mimeType = mime;

  try {
    rec = new MediaRecorder(stream, recOpts);
  } catch (e1) {
    try {
      rec = new MediaRecorder(stream, { mimeType: mime || 'video/webm' });
    } catch (e2) {
      try {
        rec = new MediaRecorder(stream);
      } catch (e3) {
        if (onProgress) onProgress('MediaRecorder not supported on this browser.');
        return null;
      }
    }
  }

  const chunks: Blob[] = [];
  rec.ondataavailable = e => {
    if (e.data && e.data.size) chunks.push(e.data);
  };

  let stopped = false;
  let rafId = 0;
  const startTime = performance.now();
  const totalMs = durationSecs * 1000;

  function finish() {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(rafId);
    if (rec.state !== 'inactive') rec.stop();
  }

  rec.onstop = () => {
    const ext = (rec.mimeType || '').indexOf('mp4') >= 0 ? 'mp4' : 'webm';
    const blobType = rec.mimeType || mime || `video/${ext}`;
    const blob = new Blob(chunks, { type: blobType });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = `gradiopak-${cfg.type.toLowerCase()}-animation.${ext}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);

    const mb = (blob.size / (1024 * 1024)).toFixed(1);
    if (onProgress) {
      onProgress(`Video exported (${ext.toUpperCase()} • ${W}×${H} • ${mb} MB)`);
    }
    if (onComplete) onComplete();
  };

  rec.onerror = () => {
    stopped = true;
    cancelAnimationFrame(rafId);
    if (onProgress) onProgress('Recording error encountered.');
    if (onComplete) onComplete();
  };

  if (cfg.layers) {
    cfg.layers.forEach(L => {
      L._astart = 0;
    });
  }

  rec.start(100);

  function frameLoop(now: number) {
    if (stopped) return;
    const elapsed = now - startTime;
    const tSec = elapsed / 1000;

    blitTo(ctx!, cfg, W, H, tSec);
    drawLayers(ctx!, cfg.layers, W, H, W / 1600, false, elapsed);
    if (cfg.credit) drawCredit(ctx!, W, H);

    const pct = Math.min(100, Math.round((elapsed / totalMs) * 100));
    if (onProgress) {
      onProgress(`Rendering video… ${pct}%`);
    }

    if (elapsed >= totalMs) {
      finish();
    } else {
      rafId = requestAnimationFrame(frameLoop);
    }
  }

  rafId = requestAnimationFrame(frameLoop);

  return {
    stopEarly: finish
  };
}
