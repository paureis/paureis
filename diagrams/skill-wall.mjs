// The skill wall: every pau-skills skill, grouped by the problem it solves, shaded by how often I use it.
import { writeFileSync } from 'node:fs';
import { esc, STYLE } from './render.mjs';

// Skill starts in the last 90 days, from the skill-usage hook's log (which-skill's usage-report.mjs).
// shortcut: a hand-copied snapshot, because the log lives on my machine; refresh it when the wall is rebuilt.
export const USAGE_AS_OF = 'November 2026';
const USES = {
  'session-close': 36, 'safe-merge': 26, 'lean-subagent-dev': 17, 'parallel-worktrees': 16,
  handoff: 7, 'which-skill': 5, 'grill-me': 4, brainstorm: 2,
  architect: 1, 'launch-readiness': 1, retrospective: 1, 'to-prd': 1,
};

const GROUPS = [
  ['Know what to build', ['brainstorm', 'grill-me', 'to-prd', 'to-issues', 'architect', 'reframe', 'sharpen',
    'engineering-principles', 'lazy-senior', 'improve-codebase-architecture', 'agent-friendly-audit']],
  ['Prove it works', ['tdd', 'evaluator', 'mutation-test', 'review-triage', 'verify-app', 'bug-fix',
    'flaky-test-hunt', 'migration-review', 'launch-readiness', 'hillclimb', 'ci-cost-and-cadence', 'skill-eval']],
  ['Run many agents', ['lean-subagent-dev', 'parallel-worktrees', 'arena', 'codebase-oracle', 'methodology',
    'overnight-run', 'geppetto']],
  ['Stay safe', ['safe-merge', 'rule-to-hook', 'dependency-upgrade', 'dependency-security-audit']],
  ['Keep improving', ['session-close', 'handoff', 'retrospective', 'which-skill', 'instructions-audit',
    'friction-review', 'project-setup', 'wizard']],
];

export const level = (uses = 0) => (uses >= 10 ? 'heavy' : uses >= 2 ? 'regular' : 'situational');

export function buildSkillWall(file = 'skill-wall.svg', outDir = new URL('../assets/', import.meta.url)) {
  const colW = 184, gapX = 12, chipH = 30, gapY = 8, top = 78;
  const rows = Math.max(...GROUPS.map(([, s]) => s.length));
  const height = top + rows * (chipH + gapY) + 70;
  const parts = [`<rect class="bg" width="1000" height="${height}" rx="12"/>`];
  let n = 0;
  GROUPS.forEach(([title, skills], c) => {
    const x = 20 + c * (colW + gapX);
    parts.push(`<text class="label" x="${x}" y="34">${esc(title)}</text>`);
    parts.push(`<text class="sub" x="${x}" y="54">${skills.length} skills</text>`);
    skills.forEach((s, r) => {
      const y = top + r * (chipH + gapY), lv = level(USES[s]);
      parts.push(`<rect class="sk-${lv}" x="${x}" y="${y}" width="${colW - 12}" height="${chipH}" rx="15"/>`);
      if (lv === 'situational') {
        // A wave of light runs across the situational skills: there when the situation calls for them.
        parts.push(`<rect class="sk-glow" style="animation-delay:${(c * 0.35 + r * 0.12).toFixed(2)}s" x="${x}" y="${y}" width="${colW - 12}" height="${chipH}" rx="15"/>`);
      }
      const fit = s.length > 24 ? ` textLength="${colW - 30}" lengthAdjust="spacingAndGlyphs"` : '';
      parts.push(`<text class="sk-t sk-t-${lv}" x="${x + (colW - 12) / 2}" y="${y + 20}" text-anchor="middle"${fit}>${esc(s)}</text>`);
      n++;
    });
  });
  const ly = height - 30;
  const legend = [['heavy', 'used most (10+ times)'], ['regular', 'used regularly'], ['situational', 'used when the situation calls for it']];
  let lx = 20;
  for (const [lv, text] of legend) {
    parts.push(`<rect class="sk-${lv}" x="${lx}" y="${ly - 13}" width="34" height="18" rx="9"/>`);
    parts.push(`<text class="sub" x="${lx + 42}" y="${ly + 1}">${esc(text)}</text>`);
    lx += 60 + text.length * 6.6;
  }
  parts.push(`<text class="note" x="980" y="${ly + 1}" text-anchor="end">usage over the last 90 days, ${USAGE_AS_OF}</text>`);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 ${height}" width="1000" height="${height}" role="img" aria-labelledby="t d">
  <title id="t">The ${n} skills in pau-skills</title>
  <desc id="d">${n} skills in five groups: know what to build, prove it works, run many agents, stay safe, keep improving. The ones used most: ${Object.keys(USES).filter((s) => level(USES[s]) === 'heavy').join(', ')}.</desc>
  <style>${STYLE}
    .sk-heavy { fill: #0969da; stroke: #0969da; }
    .sk-regular { fill: #ddf4ff; stroke: #54aeff; stroke-width: 1.5; }
    .sk-situational { fill: #f6f8fa; stroke: #d0d7de; stroke-width: 1.2; }
    .sk-glow { fill: #ddf4ff; stroke: #54aeff; stroke-width: 1.2; opacity: 0; animation: wave 7s infinite; }
    .sk-t { font-size: 12.5px; }
    .sk-t-heavy { fill: #ffffff; font-weight: 600; }
    .sk-t-situational { fill: #59636e; }
    @keyframes wave { 0% { opacity: 0; } 5% { opacity: 0.9; } 14%, 100% { opacity: 0; } }
    @media (prefers-color-scheme: dark) {
      .sk-heavy { fill: #1f6feb; stroke: #1f6feb; }
      .sk-regular { fill: #0c2d6b; stroke: #1f6feb; }
      .sk-situational { fill: #161b22; stroke: #30363d; }
      .sk-glow { fill: #0c2d6b; stroke: #1f6feb; }
      .sk-t-situational { fill: #9198a1; }
    }
    @media (prefers-reduced-motion: reduce) { .edge, .sk-glow { animation: none; } }
  </style>
  ${parts.join('\n  ')}
</svg>
`;
  writeFileSync(new URL(file, outDir), svg);
  console.log('wrote', file, `(${n} skills)`);
  return n;
}
