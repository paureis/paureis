// Refreshes the parts of README.md that come from other repos: numbers between <!--stat:NAME--> and <!--/stat-->,
// and the shipping log between <!--shipping:start--> and <!--shipping:end-->.
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

// The shipping log: one row per project with its latest release and how many shipped in the last 30 days,
// most recently released first, so one busy repo cannot crowd out the rest.
export const RELEASE_REPOS = ['pau-skills', 'cloudpin', 'cloudpin-action'];
export function renderShippingLog(releases, now = new Date()) {
  const cutoff = new Date(now.getTime() - 30 * 864e5).toISOString();
  const byRepo = new Map();
  for (const r of releases.filter((r) => !r.draft && !r.prerelease)) {
    const e = byRepo.get(r.repo) ?? { latest: r, recent: 0 };
    if (r.published_at > e.latest.published_at) e.latest = r;
    if (r.published_at >= cutoff) e.recent++;
    byRepo.set(r.repo, e);
  }
  const rows = [...byRepo.entries()]
    .sort(([, a], [, b]) => b.latest.published_at.localeCompare(a.latest.published_at))
    .map(([repo, { latest, recent }]) =>
      `| [${repo}](https://github.com/paureis/${repo}) | [${latest.tag_name}](${latest.html_url}) | ${latest.published_at.slice(0, 10)} | ${recent} |`);
  return ['| Project | Latest release | Date | Releases in the last 30 days |', '|---|---|---|---|', ...rows].join('\n');
}

// Replaces everything between <!--NAME:start--> and <!--NAME:end-->, keeping the markers.
export function applyBlock(readme, name, body) {
  const open = `<!--${name}:start-->`, close = `<!--${name}:end-->`;
  const a = readme.indexOf(open), b = readme.indexOf(close);
  if (a < 0 || b < a) throw new Error(`README has no ${open} ... ${close} block`);
  return `${readme.slice(0, a + open.length)}\n${body}\n${readme.slice(b)}`;
}

async function getJson(url) {
  const headers = process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${url} failed: ${res.status}`);
  return res.json();
}

async function main() {
  const res = await fetch('https://raw.githubusercontent.com/paureis/pau-skills/main/README.md');
  if (!res.ok) throw new Error(`fetching the pau-skills README failed: ${res.status}`);
  const stats = parseBadges(await res.text());
  const releases = (await Promise.all(RELEASE_REPOS.map(async (repo) =>
    (await getJson(`https://api.github.com/repos/paureis/${repo}/releases?per_page=100`)).map((r) => ({ ...r, repo })),
  ))).flat();
  const path = fileURLToPath(new URL('../README.md', import.meta.url));
  const before = readFileSync(path, 'utf8');
  const after = applyBlock(applyStats(before, stats), 'shipping', renderShippingLog(releases));
  if (after !== before) writeFileSync(path, after);
  console.log(after === before ? 'no change' : 'updated', JSON.stringify(stats));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
