// The hero banner: name, a line that types itself out in turn, and a small agent graph with work flowing.
import { writeFileSync } from 'node:fs';
import { esc, STYLE } from './render.mjs';

const PHRASES = [
  'I build multi-tenant products end to end.',
  'Agents write code. Tests decide what ships.',
  'No agent grades its own work.',
  'Broken rules become automatic checks.',
];
const SLOT = 4, CYCLE = SLOT * PHRASES.length; // seconds
const TX = 76, TY = 186, CHAR_W = 12.6; // monospace at 22px: Consolas is about 12.1, SF Mono 13.2; the caret lands within a character

export function buildHero(file = 'hero.svg', outDir = new URL('../assets/', import.meta.url)) {
  const kf = [], lines = [];
  PHRASES.forEach((p, i) => {
    const w = Math.ceil(p.length * CHAR_W), n = p.length, d = `animation-delay:${i * SLOT}s`;
    kf.push(`@keyframes type${i} { 0% { transform: translateX(0); animation-timing-function: steps(${n}); }
      8% { transform: translateX(${w}px); } 20% { transform: translateX(${w}px); animation-timing-function: steps(${Math.ceil(n / 3)}); }
      23%, 100% { transform: translateX(0); } }
    .ty${i} { animation: type${i} ${CYCLE}s infinite; }`);
    lines.push(`<g class="ph${i === 0 ? ' ph0' : ''}" style="${d}">
    <text class="type" x="${TX}" y="${TY}">${esc(p)}</text>
    <rect class="cover ty${i}" style="${d}" x="${TX - 2}" y="${TY - 24}" width="${w + 24}" height="34"/>
    <g class="ty${i}" style="${d}"><rect class="caret" x="${TX + 1}" y="${TY - 19}" width="3" height="24"/></g>
  </g>`);
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 240" width="1000" height="240" role="img" aria-labelledby="t d">
  <title id="t">Alvaro "Pau" Reis, AI engineer</title>
  <desc id="d">Alvaro "Pau" Reis, AI engineer in Broward County, Florida. ${esc(PHRASES.join(' '))}</desc>
  <defs>
    <radialGradient id="g1"><stop offset="0" stop-color="#54aeff" stop-opacity="0.35"/><stop offset="1" stop-color="#54aeff" stop-opacity="0"/></radialGradient>
    <radialGradient id="g2"><stop offset="0" stop-color="#c297ff" stop-opacity="0.35"/><stop offset="1" stop-color="#c297ff" stop-opacity="0"/></radialGradient>
    <marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="head" d="M0 0 L10 5 L0 10 z"/></marker>
  </defs>
  <style>${STYLE}
    .name { font-size: 44px; font-weight: 700; }
    .role { font-size: 18px; fill: #59636e; }
    .type { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 22px; }
    .prompt { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 22px; fill: #0969da; font-weight: 700; }
    .cover { fill: #ffffff; }
    .caret { fill: #0969da; animation: blink 1s steps(1) infinite; }
    [class^="ph"] { opacity: 0; animation: vis ${CYCLE}s infinite; }
    .drift1 { animation: drift 14s ease-in-out infinite alternate; }
    .drift2 { animation: drift 18s ease-in-out infinite alternate-reverse; }
    .pulse { animation: pulse 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes vis { 0%, 24% { opacity: 1; } 24.5%, 100% { opacity: 0; } }
    @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0; } }
    @keyframes drift { from { transform: translate(0, 0); } to { transform: translate(-30px, 20px); } }
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.12); } }
    ${kf.join('\n    ')}
    @media (prefers-color-scheme: dark) {
      .role { fill: #9198a1; }
      .prompt, .caret { fill: #4493f8; }
      .cover { fill: #0d1117; }
    }
    @media (prefers-reduced-motion: reduce) {
      .edge, .drift1, .drift2, .pulse, [class^="ph"], [class*=" ty"] { animation: none; }
      .ph0 { opacity: 1; } .cover, .caret { display: none; }
    }
  </style>
  <rect class="bg" width="1000" height="240" rx="16"/>
  <text class="name" x="48" y="92">Alvaro "Pau" Reis</text>
  <text class="role" x="50" y="128">AI engineer · Broward County, Florida</text>
  <text class="prompt" x="48" y="${TY}">›</text>
  ${lines.join('\n  ')}
  <!-- The glow sits above the typing mask, so the mask blends in wherever it slides. -->
  <circle class="drift1" cx="900" cy="90" r="160" fill="url(#g1)"/>
  <circle class="drift2" cx="950" cy="190" r="140" fill="url(#g2)"/>
  <path class="edge" d="M796 120 C840 120 850 66 898 66" marker-end="url(#a)"/>
  <path class="edge" d="M796 120 L906 120" marker-end="url(#a)"/>
  <path class="edge" d="M796 120 C840 120 850 174 898 174" marker-end="url(#a)"/>
  <circle class="core pulse" cx="772" cy="120" r="24"/>
  <circle class="ai" cx="920" cy="66" r="13"/>
  <circle class="ai" cx="928" cy="120" r="13"/>
  <circle class="ai" cx="920" cy="174" r="13"/>
</svg>
`;
  writeFileSync(new URL(file, outDir), svg);
  console.log('wrote', file);
}
