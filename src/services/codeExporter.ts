import { GradientConfig } from '../types';
import { geoStops, lighten, luma, validPairs } from '../engine/colors/colorMath';

export function downloadTextFile(name: string, content: string, mime?: string) {
  const blob = new Blob([content], { type: mime || 'text/html;charset=utf-8' });
  const u = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}

export function gradientCssLine(cfg: GradientConfig): string {
  const stops = geoStops(cfg);
  const fmt = (a: string[]) =>
    a.map((v, i) => `${v} ${Math.round((i / Math.max(a.length - 1, 1)) * 100)}%`).join(', ');

  if (cfg.type === 'Linear' || cfg.type === 'Reflected') {
    return `background: linear-gradient(${cfg.direction || 0}deg, ${fmt(stops)});`;
  }
  if (cfg.type === 'Radial') {
    return `background: radial-gradient(circle at 50% 50%, ${fmt(stops)});`;
  }
  if (cfg.type === 'Conic') {
    return `background: conic-gradient(from ${cfg.direction || 0}deg at 50% 50%, ${fmt(stops)});`;
  }
  if (cfg.type === 'Diamond') {
    return `background: radial-gradient(circle at 50% 50%, ${fmt(stops)});`;
  }

  const pairs = validPairs(cfg);
  const cols = pairs.map(p => (cfg.genre === 'Pastel' ? lighten(p[0], 0.42) : p[0]));
  const base = cols.slice().sort((x, y) => luma(x) - luma(y))[0];
  const layers = pairs
    .map(
      (p, i) =>
        `radial-gradient(at ${Math.round(p[1][0] * 100)}% ${Math.round(p[1][1] * 100)}%, ${cols[i]} 0px, transparent 62%)`
    )
    .join(', ');
  return `background-color: ${base};\nbackground-image: ${layers};`;
}

export function tailwindSnippet(cfg: GradientConfig): string {
  const stops = geoStops(cfg);
  if (cfg.type === 'Linear') {
    const stopsStr = stops.join(',').replace(/#/g, '%23');
    return `bg-[linear-gradient(${cfg.direction}deg,${stops.join(',')})]`;
  }
  if (cfg.type === 'Radial') {
    return `bg-[radial-gradient(circle_at_center,${stops.join(',')})]`;
  }
  return `/* Use arbitrary CSS style for organic/multispot gradient */`;
}

function escH(x: string): string {
  return String(x)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildHtmlExport(cfg: GradientConfig): string {
  const ratio = (cfg.ratio || '16/9').split('/');
  const ar = `${ratio[0]}/${ratio[1]}`;
  const css = gradientCssLine(cfg);
  const rules = [
    `.grad{position:relative;width:min(100%,960px);aspect-ratio:${ar};overflow:hidden;border-radius:14px;box-shadow:0 24px 64px rgba(0,0,0,0.5);${css}}`
  ];
  const body: string[] = [];

  cfg.layers.forEach((L, i) => {
    if (L.visible === false) return;
    const cls = `gl${i + 1}`;
    const bs = `left:${L.x || 50}%;top:${L.y || 50}%;opacity:${L.opacity == null ? 1 : L.opacity};`;
    if (L.kind === 'text' && String(L.textValue || '').trim()) {
      const ln = String(L.textValue || '').split('\n').join('<br>');
      const st = `${bs}font-family:'${escH(String(L.textFont || 'Plus Jakarta Sans'))}',sans-serif;font-size:${L.textSize || 100}px;font-weight:${L.textWeight || '400'};color:${L.textColor || '#FFFFFF'};text-align:${L.textAlign || 'center'};letter-spacing:${L.sp || 0}px;line-height:${L.lineH || 1.18};transform:translate(-50%,-50%) rotate(${L.rot || 0}deg);`;
      body.push(`<div class="${cls}" style="${st}">${escH(ln)}</div>`);
    }
  });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Gradiopak Export — ${cfg.type} ${cfg.genre}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
  <style>
    html, body {
      margin: 0;
      background: #08090c;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      box-sizing: border-box;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    }
    * { box-sizing: border-box; }
    ${rules.join('\n')}
  </style>
</head>
<body>
  <div class="grad">
    ${body.join('\n    ')}
  </div>
</body>
</html>`;
}
