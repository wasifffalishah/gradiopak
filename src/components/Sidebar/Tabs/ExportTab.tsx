import React, { useState } from 'react';
import { useStudio } from '../../../state/useStudioStore';
import { outSize } from '../../../engine/colors/colorMath';
import { exportJPEG, exportPNG, exportSocialCard, exportWebP } from '../../../services/imageExporter';
import { ActiveVideoJob, exportMP4Video } from '../../../services/videoExporter';
import { buildHtmlExport, downloadTextFile, gradientCssLine } from '../../../services/codeExporter';
import { encodeStateToHash } from '../../../state/urlShortener';
import { Slider } from '../Controls/Slider';
import { Download, Share2, Video, Copy, Check, FileCode, Sparkles } from 'lucide-react';

export const ExportTab: React.FC = () => {
  const { config, updateConfig, setStatus } = useStudio();
  const [videoQuality, setVideoQuality] = useState('1080p60');
  const [videoDuration, setVideoDuration] = useState(4);
  const [isRecording, setIsRecording] = useState(false);
  const [activeJob, setActiveJob] = useState<ActiveVideoJob | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCss, setCopiedCss] = useState(false);

  const dims = outSize(config.ratio, config.custW, config.custH);
  const cssCode = gradientCssLine(config);

  const handleCopyLink = () => {
    const base = window.location.href.split('#')[0];
    const fullUrl = base + encodeStateToHash(config);
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedLink(true);
      setStatus('Share link copied to clipboard');
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const handleCopyCss = () => {
    navigator.clipboard.writeText(cssCode).then(() => {
      setCopiedCss(true);
      setStatus('CSS snippet copied');
      setTimeout(() => setCopiedCss(false), 2000);
    });
  };

  const handleExportVideo = () => {
    if (activeJob) {
      activeJob.stopEarly();
      setActiveJob(null);
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    const job = exportMP4Video(
      config,
      videoDuration,
      videoQuality,
      msg => setStatus(msg),
      () => {
        setIsRecording(false);
        setActiveJob(null);
      }
    );
    if (job) setActiveJob(job);
    else setIsRecording(false);
  };

  const handleExportHtml = () => {
    const html = buildHtmlExport(config);
    downloadTextFile(`gradiopak-${config.type.toLowerCase()}.html`, html, 'text/html;charset=utf-8');
    setStatus('Standalone interactive HTML export downloaded');
  };

  return (
    <div id="secExport" className="flex flex-col gap-6 p-4">
      {/* Export Specifications */}
      <section className="flex flex-col gap-2 p-3 rounded-xl bg-surface-2/60 border border-line">
        <div className="flex items-center justify-between text-xs">
          <span className="text-mute">Export Size</span>
          <span className="font-mono text-ink font-semibold">
            {dims.w} × {dims.h} px
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-mute">Renderer</span>
          <span className="font-mono text-accent-green font-semibold">WebGL Shader 2.0</span>
        </div>
      </section>

      {/* Image Exports */}
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">Raster & Social Exports</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => exportPNG(config, setStatus)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-ink text-canvas font-semibold text-xs hover:opacity-95 shadow-sm transition-all"
          >
            <Download size={14} />
            <span>Export PNG</span>
          </button>
          <button
            type="button"
            onClick={() => exportJPEG(config, setStatus)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-surface-2 text-ink border border-line hover:border-line-strong text-xs font-semibold transition-all"
          >
            <Download size={14} />
            <span>JPEG</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => exportWebP(config, setStatus)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-surface-2 text-mute hover:text-ink border border-line hover:border-line-strong text-xs font-medium transition-all"
          >
            <Download size={13} />
            <span>WebP</span>
          </button>
          <button
            type="button"
            onClick={() => exportSocialCard(config, setStatus)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-surface-2 text-mute hover:text-ink border border-line hover:border-line-strong text-xs font-medium transition-all"
          >
            <Sparkles size={13} />
            <span>Share Card (OG)</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-surface-2 text-mute hover:text-ink border border-line hover:border-line-strong text-xs font-medium transition-all"
          >
            {copiedLink ? <Check size={13} className="text-accent-green" /> : <Share2 size={13} />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Share Link'}</span>
          </button>
        </div>
      </section>

      {/* Video MP4 / WebM Export */}
      <section className="flex flex-col gap-2.5">
        <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">Video Animation Export</h3>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={videoQuality}
            onChange={e => setVideoQuality(e.target.value)}
            disabled={isRecording}
            className="px-2.5 py-1.5 text-xs text-ink bg-surface-2 rounded-lg border border-line focus:border-line-strong outline-none"
          >
            <option value="1080p60">1080p • 60 fps (Full HD)</option>
            <option value="2k60">2K • 60 fps (Quad HD)</option>
            <option value="1080p30">1080p • 30 fps (Standard)</option>
            <option value="720p60">720p • 60 fps (Fast)</option>
            <option value="720p30">720p • 30 fps (Compact)</option>
          </select>
          <button
            type="button"
            onClick={handleExportVideo}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              isRecording
                ? 'bg-accent-red text-white animate-pulse'
                : 'bg-surface-3 text-ink border border-line hover:border-line-strong'
            }`}
          >
            <Video size={14} />
            <span>{isRecording ? 'Finish & Download' : 'MP4 / WebM'}</span>
          </button>
        </div>

        <Slider
          label="Recording Duration"
          value={videoDuration}
          min={1}
          max={15}
          step={0.5}
          formatValue={v => `${v.toFixed(1)}s`}
          onChange={v => setVideoDuration(v)}
        />

        <label className="flex items-center gap-2 text-xs text-mute cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={config.credit}
            onChange={e => updateConfig({ credit: e.target.checked })}
            className="rounded border-line bg-surface-2 text-ink focus:ring-0"
          />
          <span>Discreet credit watermark on exports</span>
        </label>
      </section>

      {/* Code Export: CSS Snippet & Standalone HTML */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">CSS & Code</h3>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleExportHtml}
              className="flex items-center gap-1 px-2 py-0.5 text-xs text-mute hover:text-ink hover:bg-surface-3 rounded transition-colors"
              title="Download standalone single-file HTML"
            >
              <FileCode size={12} />
              <span>HTML File</span>
            </button>
            <button
              type="button"
              onClick={handleCopyCss}
              className="flex items-center gap-1 px-2 py-0.5 text-xs text-mute hover:text-ink hover:bg-surface-3 rounded transition-colors"
            >
              {copiedCss ? <Check size={12} className="text-accent-green" /> : <Copy size={12} />}
              <span>{copiedCss ? 'Copied' : 'Copy CSS'}</span>
            </button>
          </div>
        </div>

        <textarea
          readOnly
          value={cssCode}
          rows={3}
          className="w-full p-2.5 text-[11px] font-mono text-body bg-surface-2 rounded-lg border border-line select-all outline-none resize-none"
        />
      </section>
    </div>
  );
};
