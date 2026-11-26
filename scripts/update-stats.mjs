// Refreshes the numbers in README.md that come from other repos, between <!--stat:NAME--> and <!--/stat--> markers.
// Run by .github/workflows/profile.yml every night; run it by hand with: node scripts/update-stats.mjs
// shortcut: test counts stay hand-edited, because reading another repo's CI logs needs a token with admin rights.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// pau-skills keeps its own counts in its README badges, e.g. ![Skills: 41](.../badge/skills-41-informational).
export function parseBadges(readme) {
  const get = (name) => {
    const m = readme.match(new RegExp(`badge/${name}-(\\d+)-`, 'i'));
    if (!m) throw new Error(`pau-skills README has no ${name} badge`);
    return Number(m[1]);
  };
  return { skills: get('skills'), hooks: get('hooks') };
}

// Replaces each marker's contents. A marker missing from the README is an error, so a deleted marker
// fails the workflow instead of quietly leaving a number to go stale.
export function applyStats(readme, stats) {
  let out = readme;
  for (const [name, value] of Object.entries(stats)) {
    const re = new RegExp(`(<!--stat:${name}-->)[^<]*(<!--/stat-->)`, 'g');
    if (!re.test(out)) throw new Error(`README has no <!--stat:${name}--> marker`);
    out = out.replace(re, (_, open, close) => `${open}${value}${close}`);
  }
  return out;
}

async function main() {
  const res = await fetch('https://raw.githubusercontent.com/paureis/pau-skills/main/README.md');
  if (!res.ok) throw new Error(`fetching the pau-skills README failed: ${res.status}`);
  const stats = parseBadges(await res.text());
  const path = fileURLToPath(new URL('../README.md', import.meta.url));
  const before = readFileSync(path, 'utf8');
  const after = applyStats(before, stats);
  if (after !== before) writeFileSync(path, after);
  console.log(after === before ? 'no change' : 'updated', JSON.stringify(stats));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
