// Options for the right-hand art of the hero banner, drawn in the area x 640-990.
// Each art is a function of t0, the second its show starts, returning { css, svg }. Every looping
// animation inside runs on a SLIDE-second cycle (or a divisor), so in the carousel each art restarts
// exactly when its slide comes round.
import { esc } from './render.mjs';

export const SLIDE = 8;
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

// Orbit: agents circle the orchestrator; every piece of work crosses a ring of hooks and turns green once checked.
const CX = 830, CY = 112;
function orbit(t0 = 0) {
  return {
    css: `.spin { transform-origin: ${CX}px ${CY}px; animation: spin 32s linear infinite; }
    .o1, .o2, .o3 { transform-origin: ${CX}px ${CY}px; animation: spin 16s linear infinite; }
    .o2 { animation-duration: 24s; animation-direction: reverse; }
    .ring { fill: none; stroke: #d4a72c; stroke-width: 2; stroke-dasharray: 3 7; }
    .track { fill: none; stroke: #d0d7de; stroke-width: 1; }
    .pkt { fill: #8250df; opacity: 0; animation: shoot 2s ease-out infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes shoot { 0% { transform: translateX(0); opacity: 0; fill: #8250df; }
      12% { opacity: 1; } 52% { fill: #8250df; } 60% { fill: #1a7f37; }
      100% { transform: translateX(96px); opacity: 0; fill: #1a7f37; } }
    @media (prefers-color-scheme: dark) { .track { stroke: #30363d; } .pkt { fill: #a371f7; } }`,
    svg: `<circle class="track" cx="${CX}" cy="${CY}" r="96"/>
  <circle class="ring spin" cx="${CX}" cy="${CY}" r="60"/>
  ${[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) =>
    `<g transform="rotate(${a} ${CX} ${CY})"><circle class="pkt" style="animation-delay:${(t0 + i * 0.25).toFixed(2)}s" cx="${CX}" cy="${CY}" r="4.5"/></g>`).join('\n  ')}
  <circle class="core pulse" cx="${CX}" cy="${CY}" r="28"/>
  <g class="o1"><circle class="ai" cx="${CX + 96}" cy="${CY}" r="11"/></g>
  <g class="o2" style="animation-delay:-7s"><circle class="ai" cx="${CX + 96}" cy="${CY}" r="11"/></g>
  <g class="o3" style="animation-delay:-11s"><circle class="ai" cx="${CX + 96}" cy="${CY}" r="11"/></g>`,
  };
}

// Terminal: the method plays out as a session log, one line at a time.
const LOG = [
  ['cmd', 'grill-me'], ['ok', 'every open decision settled'],
  ['cmd', 'tdd'], ['redgreen', ''],
  ['cmd', 'evaluator'], ['ok', 'a fresh agent found nothing'],
  ['cmd', 'safe-merge'], ['ok', 'merged the reviewed commit'],
];
function terminal(t0 = 0) {
  // One keyframe set per line (not per-line delays), so every line clears together at the end of the slide.
  const kf = LOG.map((_, i) => {
    const on = ((i * 0.6) / SLIDE) * 100;
    return `@keyframes tl${i} { 0%, ${on.toFixed(1)}% { opacity: 0; } ${(on + 1.5).toFixed(1)}%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
    .tl${i} { animation: tl${i} ${SLIDE}s infinite; animation-delay: ${t0}s; }`;
  }).join('\n    ');
  const line = ([kind, text], i) => {
    const body = kind === 'cmd' ? `$ <tspan class="cmd">${esc(text)}</tspan>`
      : kind === 'ok' ? `  <tspan class="ok">✓</tspan> ${esc(text)}`
      : `  <tspan class="bad">✗</tspan> red  →  <tspan class="ok">✓</tspan> green`;
    return `<text class="tl tl${i}" x="656" y="${78 + i * 18}" xml:space="preserve">${body}</text>`;
  };
  return {
    css: `.term { fill: #f6f8fa; stroke: #d0d7de; stroke-width: 1.2; }
    .tl { font-family: ${MONO}; font-size: 13.5px; opacity: 0; }
    .cmd { fill: #0969da; font-weight: 700; } .ok { fill: #1a7f37; font-weight: 700; } .bad { fill: #cf222e; font-weight: 700; }
    ${kf}
    @media (prefers-color-scheme: dark) { .term { fill: #161b22; stroke: #30363d; } .cmd { fill: #4493f8; } .ok { fill: #3fb950; } .bad { fill: #f85149; } }`,
    svg: `<rect class="term" x="640" y="24" width="345" height="192" rx="10"/>
  <circle cx="660" cy="42" r="5" fill="#ff5f57"/><circle cx="676" cy="42" r="5" fill="#febc2e"/><circle cx="692" cy="42" r="5" fill="#28c840"/>
  <text class="sub" x="812" y="46" text-anchor="middle">orchestrator</text>
  ${LOG.map(line).join('\n  ')}`,
  };
}

// Gates: a change travels through plan, test, review and ship and turns green; the next one is stopped at test.
const G = { start: 650, plan: 720, test: 800, review: 880, ship: 955, y: 132 };
function gates(t0 = 0) {
  const end = G.ship - G.start - 9, stop = G.test - G.start;
  return {
    css: `.gate { stroke: #d0d7de; stroke-width: 3; stroke-linecap: round; }
    .rail { stroke: #d0d7de; stroke-width: 2; stroke-dasharray: 2 6; }
    .gtest { animation: gflash ${SLIDE}s infinite ${t0}s; }
    .good { fill: #8250df; animation: good ${SLIDE}s infinite ${t0}s; }
    .badb { fill: #8250df; opacity: 0; animation: badb ${SLIDE}s infinite ${t0}s; }
    @keyframes good { 0% { transform: translateX(0); fill: #8250df; opacity: 1; } 28% { fill: #8250df; } 32% { fill: #1a7f37; }
      58%, 66% { transform: translateX(${end}px); opacity: 1; fill: #1a7f37; } 72%, 100% { transform: translateX(${end}px); opacity: 0; fill: #1a7f37; } }
    @keyframes badb { 0%, 48% { transform: translateX(0); opacity: 0; } 50% { opacity: 1; fill: #8250df; }
      64% { transform: translateX(${stop - 22}px); fill: #8250df; } 66% { fill: #cf222e; transform: translateX(${stop - 16}px); }
      68% { transform: translateX(${stop - 24}px); } 70% { transform: translateX(${stop - 18}px); fill: #cf222e; opacity: 1; }
      84% { transform: translateX(0); opacity: 0; fill: #cf222e; } 100% { opacity: 0; } }
    @keyframes gflash { 0%, 25% { stroke: #d0d7de; } 28%, 34% { stroke: #1a7f37; } 38%, 63% { stroke: #d0d7de; } 65%, 74% { stroke: #cf222e; } 78%, 100% { stroke: #d0d7de; } }
    @media (prefers-color-scheme: dark) { .gate, .rail { stroke: #30363d; } }`,
    svg: `<line class="rail" x1="${G.start}" y1="${G.y}" x2="985" y2="${G.y}"/>
  ${['plan', 'test', 'review', 'ship'].map((k) =>
    `<line class="gate${k === 'test' ? ' gtest' : ''}" x1="${G[k]}" y1="${G.y - 30}" x2="${G[k]}" y2="${G.y + 30}"/>
  <text class="sub" x="${G[k]}" y="${G.y - 40}" text-anchor="middle">${k}</text>`).join('\n  ')}
  <rect class="good" x="${G.start}" y="${G.y - 9}" width="18" height="18" rx="4"/>
  <rect class="badb" x="${G.start}" y="${G.y - 9}" width="18" height="18" rx="4"/>
  <text class="note" x="${(G.start + 985) / 2}" y="${G.y + 62}" text-anchor="middle">nothing ships until it is proven</text>`,
  };
}

// Grid: a contribution graph of my commits, with a purple wave of agent work rolling across it.
const ROWS = 8, COLS = 18, SQ = 13, STEP = 17, GX = 668, GY = 40;
function grid(t0 = 0) {
  let seed = 7;
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const cells = [];
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
    const lv = Math.min(4, Math.floor(rand() * 5.4)), x = GX + c * STEP, y = GY + r * STEP;
    cells.push(`<rect class="lv${lv}" x="${x}" y="${y}" width="${SQ}" height="${SQ}" rx="3"/>`);
    cells.push(`<rect class="wave" style="animation-delay:${(t0 + (c + r * 0.6) * 0.11).toFixed(2)}s" x="${x}" y="${y}" width="${SQ}" height="${SQ}" rx="3"/>`);
  }
  return {
    css: `.lv0 { fill: #ebedf0; } .lv1 { fill: #9be9a8; } .lv2 { fill: #40c463; } .lv3 { fill: #30a14e; } .lv4 { fill: #216e39; }
    .wave { fill: #8250df; opacity: 0; animation: gwave ${SLIDE / 2}s infinite; }
    @keyframes gwave { 0% { opacity: 0; } 6% { opacity: 0.85; } 18%, 100% { opacity: 0; } }
    @media (prefers-color-scheme: dark) { .lv0 { fill: #161b22; } .lv1 { fill: #0e4429; } .lv2 { fill: #006d32; } .lv3 { fill: #26a641; } .lv4 { fill: #39d353; } .wave { fill: #a371f7; } }`,
    svg: `${cells.join('\n  ')}
  <text class="note" x="${GX}" y="${GY + ROWS * STEP + 18}">my commits, with agents riding the wave</text>`,
  };
}

// Carousel: each art plays its full show for one slide, then hands over to the next; dots mark which is on.
function carousel() {
  const arts = [terminal, orbit, gates, grid];
  const T = SLIDE * arts.length, fade = (0.5 / T) * 100, on = 100 / arts.length;
  const parts = arts.map((fn, k) => ({ k, ...fn(k * SLIDE) }));
  const dots = arts.map((_, k) => {
    const x = 812 + (k - (arts.length - 1) / 2) * 16;
    return `<circle class="dot" cx="${x}" cy="230" r="3.5"/><circle class="dot-on slide" style="animation-delay:${k * SLIDE}s" cx="${x}" cy="230" r="3.5"/>`;
  }).join('');
  return {
    css: `${parts.map((p) => p.css).join('\n    ')}
    .slide { opacity: 0; animation: slide ${T}s infinite; }
    @keyframes slide { 0% { opacity: 0; } ${fade.toFixed(2)}%, ${(on - fade).toFixed(2)}% { opacity: 1; } ${on.toFixed(2)}%, 100% { opacity: 0; } }
    .dot { fill: #d0d7de; } .dot-on { fill: #0969da; }
    @media (prefers-color-scheme: dark) { .dot { fill: #30363d; } .dot-on { fill: #4493f8; } }
    @media (prefers-reduced-motion: reduce) { .slide, .slide * { animation: none !important; } .slide0, .slide0 .tl { opacity: 1; } }`,
    svg: `${parts.map((p) => `<g class="slide slide${p.k}" style="animation-delay:${p.k * SLIDE}s">\n  ${p.svg}\n  </g>`).join('\n  ')}
  ${dots}`,
  };
}

export const ART = { carousel, terminal, orbit, gates, grid };
