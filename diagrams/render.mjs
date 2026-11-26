// Turns a diagram description (nodes, edges, groups) into a themed, animated SVG in ../assets.
// Every SVG follows the viewer's light or dark mode and stops animating when they turn motion off.
import { writeFileSync, mkdirSync } from 'node:fs';

const OUT = new URL('../assets/', import.meta.url);
mkdirSync(OUT, { recursive: true });

export const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const STYLE = `
    :root { --hl-fill: #fff8c5; --hl-stroke: #bf8700; }
    .bg { fill: #ffffff; }
    text { font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; fill: #1f2328; }
    .box { fill: #f6f8fa; stroke: #d0d7de; stroke-width: 1.5; }
    .core { fill: #ddf4ff; stroke: #54aeff; stroke-width: 1.5; }
    .ai { fill: #fbefff; stroke: #c297ff; stroke-width: 1.5; }
    .human { fill: #dafbe1; stroke: #4ac26b; stroke-width: 1.5; }
    .guard { fill: #fff8c5; stroke: #d4a72c; stroke-width: 1.5; }
    .group { fill: none; stroke: #d0d7de; stroke-width: 1.5; stroke-dasharray: 6 5; }
    .panel { fill: #f6f8fa; stroke: #d0d7de; stroke-width: 1.2; }
    .edge { stroke: #656d76; stroke-width: 1.6; fill: none; stroke-dasharray: 7 5; animation: flow 1.2s linear infinite; }
    .head { fill: #656d76; }
    .label { font-size: 15px; font-weight: 600; }
    .sub { font-size: 12px; fill: #59636e; }
    .note { font-size: 12px; fill: #59636e; font-style: italic; }
    .caption { font-size: 15px; }
    @keyframes flow { to { stroke-dashoffset: -24; } }
    @media (prefers-color-scheme: dark) {
      :root { --hl-fill: #3b2e00; --hl-stroke: #d29922; }
      .bg { fill: #0d1117; }
      text { fill: #e6edf3; }
      .box, .panel { fill: #161b22; stroke: #30363d; }
      .core { fill: #0c2d6b; stroke: #1f6feb; }
      .ai { fill: #271052; stroke: #8957e5; }
      .human { fill: #04260f; stroke: #2ea043; }
      .guard { fill: #3b2e00; stroke: #9e6a03; }
      .group { stroke: #30363d; }
      .edge { stroke: #8b949e; }
      .head { fill: #8b949e; }
      .sub, .note { fill: #9198a1; }
    }`;

function anchor(n, side) {
  const cx = n.x + n.w / 2, cy = n.y + n.h / 2;
  return { l: [n.x, cy], r: [n.x + n.w, cy], t: [cx, n.y], b: [cx, n.y + n.h] }[side];
}

function edgePath(a, as, b, bs) {
  const [x1, y1] = a, [x2, y2] = b;
  if (x1 === x2 || y1 === y2) return `M${x1} ${y1} L${x2} ${y2}`;
  const c1 = as === 'l' || as === 'r' ? [(x1 + x2) / 2, y1] : [x1, (y1 + y2) / 2];
  const c2 = bs === 'l' || bs === 'r' ? [(x1 + x2) / 2, y2] : [x2, (y1 + y2) / 2];
  return `M${x1} ${y1} C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${x2} ${y2}`;
}

// Pull the arrow tip back 2px so the marker doesn't sit on the box border.
function shorten([x, y], side) {
  return { l: [x - 2, y], r: [x + 2, y], t: [x, y - 2], b: [x, y + 2] }[side];
}

function node(n) {
  const cx = n.x + n.w / 2;
  const out = [`<rect class="${n.kind ?? 'box'}" x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="10"/>`];
  if (n.lines) {
    out.push(`<text class="label" x="${cx}" y="${n.y + 30}" text-anchor="middle">${esc(n.label)}</text>`);
    n.lines.forEach((l, i) => out.push(`<text class="sub" x="${cx}" y="${n.y + 58 + i * 20}" text-anchor="middle">${esc(l)}</text>`));
  } else if (n.sub) {
    out.push(`<text class="label" x="${cx}" y="${n.y + n.h / 2 - 3}" text-anchor="middle">${esc(n.label)}</text>`);
    out.push(`<text class="sub" x="${cx}" y="${n.y + n.h / 2 + 15}" text-anchor="middle">${esc(n.sub)}</text>`);
  } else {
    out.push(`<text class="label" x="${cx}" y="${n.y + n.h / 2 + 5}" text-anchor="middle">${esc(n.label)}</text>`);
  }
  return out.join('\n  ');
}

export function diagram({ file, title, desc, width = 1000, height, nodes, edges, groups = [], extra = '' }) {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  // An opaque background keeps the labels readable when GitHub's theme and the OS theme disagree.
  const parts = [`<rect class="bg" width="${width}" height="${height}" rx="12"/>`];
  for (const g of groups) {
    parts.push(`<rect class="group" x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="12"/>`);
    parts.push(`<text class="sub" x="${g.x + 16}" y="${g.y + 22}">${esc(g.label)}</text>`);
  }
  for (const e of edges) {
    const [fid, fs] = e.from, [tid, ts] = e.to;
    if (!byId[fid] || !byId[tid]) throw new Error(`${file}: edge to unknown node ${fid} -> ${tid}`);
    const a = anchor(byId[fid], fs), b = shorten(anchor(byId[tid], ts), ts);
    parts.push(`<path class="edge" d="${edgePath(a, fs, b, ts)}" marker-end="url(#a)"/>`);
    if (e.label) {
      const [lx, ly] = e.at ?? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 10];
      parts.push(`<text class="note" x="${lx}" y="${ly}" text-anchor="${e.anchor ?? 'middle'}">${esc(e.label)}</text>`);
    }
  }
  for (const n of nodes) parts.push(node(n));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-labelledby="t d">
  <title id="t">${esc(title)}</title>
  <desc id="d">${esc(desc)}</desc>
  <style>${STYLE}
    @media (prefers-reduced-motion: reduce) { .edge { animation: none; } }
  </style>
  <defs>
    <marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path class="head" d="M0 0 L10 5 L0 10 z"/>
    </marker>
  </defs>
  ${parts.join('\n  ')}
  ${extra}
</svg>
`;
  writeFileSync(new URL(file, OUT), svg);
  console.log('wrote', file);
}
