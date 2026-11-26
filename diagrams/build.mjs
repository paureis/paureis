// The README diagrams as data; render.mjs draws them. Run: node diagrams/build.mjs
// The skill wall and the hero banner have their own files: skill-wall.mjs and hero.mjs.
import { diagram, esc } from './render.mjs';
import { buildSkillWall } from './skill-wall.mjs';
import { buildHero } from './hero.mjs';

buildSkillWall();
buildHero();

diagram({
  file: 'miconsultorio-architecture.svg',
  title: 'MiConsultorio architecture',
  desc: 'Staff app, patient portal and operator console call a Next.js app on Vercel, which reaches Postgres with row-level security using the user\'s session, never a service key. Postgres records an audit trail through triggers; the app renders branded PDFs. A scheduled job feeds a message queue that sends WhatsApp reminders. Staging is seeded; production receives migrations only.',
  height: 460,
  nodes: [
    { id: 'staff', x: 20, y: 40, w: 170, h: 48, label: 'Staff app', kind: 'human' },
    { id: 'portal', x: 20, y: 110, w: 170, h: 48, label: 'Patient portal', kind: 'human' },
    { id: 'ops', x: 20, y: 180, w: 170, h: 48, label: 'Operator console', kind: 'human' },
    { id: 'next', x: 290, y: 104, w: 190, h: 60, label: 'Next.js', sub: 'App Router on Vercel', kind: 'core' },
    { id: 'db', x: 700, y: 104, w: 210, h: 60, label: 'Postgres 17', sub: 'row-level security per role', kind: 'core' },
    { id: 'audit', x: 715, y: 230, w: 180, h: 44, label: 'Audit triggers', kind: 'guard' },
    { id: 'pdf', x: 295, y: 230, w: 180, h: 44, label: 'Branded PDFs' },
    { id: 'cron', x: 20, y: 330, w: 170, h: 44, label: 'Scheduled job' },
    { id: 'queue', x: 290, y: 330, w: 190, h: 44, label: 'Message queue' },
    { id: 'wa', x: 550, y: 330, w: 180, h: 44, label: 'WhatsApp reminders' },
    { id: 'stg', x: 780, y: 332, w: 180, h: 36, label: 'Staging · seeded' },
    { id: 'prod', x: 780, y: 388, w: 180, h: 36, label: 'Production' },
  ],
  groups: [{ x: 760, y: 300, w: 220, h: 140, label: 'Environments' }],
  edges: [
    { from: ['staff', 'r'], to: ['next', 'l'] },
    { from: ['portal', 'r'], to: ['next', 'l'] },
    { from: ['ops', 'r'], to: ['next', 'l'] },
    { from: ['next', 'r'], to: ['db', 'l'], label: 'user session, never a service key' },
    { from: ['db', 'b'], to: ['audit', 't'] },
    { from: ['next', 'b'], to: ['pdf', 't'] },
    { from: ['cron', 'r'], to: ['queue', 'l'] },
    { from: ['queue', 'r'], to: ['wa', 'l'] },
    { from: ['stg', 'b'], to: ['prod', 't'], label: 'migrations only', at: [880, 382], anchor: 'start' },
  ],
});

diagram({
  file: 'recourse-architecture.svg',
  title: 'Recourse pipeline',
  desc: 'Muse Spark reads a denial letter into a case and works out which program\'s rules apply. It investigates public Florida Medicaid, Medicare and HIPAA documents; every finding is a quote checked against its page, and unsupported findings are struck out on screen. It argues the payer\'s side, then gives one of three verdicts: consistent, inconsistent or not settled. An open-weights model gives a second opinion on the same evidence. An inconsistent denial gets an appeal letter in which every sentence carries a verified citation. A human-verified golden set and reviewed denial letters measure the chain.',
  height: 500,
  nodes: [
    { id: 'letter', x: 20, y: 40, w: 150, h: 48, label: 'Denial letter', kind: 'human' },
    { id: 'route', x: 210, y: 34, w: 190, h: 60, label: 'Read and route', sub: 'which rules apply', kind: 'ai' },
    { id: 'invest', x: 440, y: 34, w: 230, h: 60, label: 'Investigate', sub: 'every quote checked on its page', kind: 'guard' },
    { id: 'steel', x: 710, y: 34, w: 270, h: 60, label: 'Argue the payer\'s side', sub: 'before deciding', kind: 'ai' },
    { id: 'verdict', x: 710, y: 160, w: 270, h: 60, label: 'Verdict', sub: 'consistent · inconsistent · not settled', kind: 'core' },
    { id: 'second', x: 340, y: 160, w: 250, h: 60, label: 'Second opinion', sub: 'open-weights model, same evidence', kind: 'ai' },
    { id: 'appeal', x: 710, y: 270, w: 270, h: 60, label: 'Appeal letter', sub: 'every sentence cited and verified', kind: 'human' },
    { id: 'golden', x: 40, y: 380, w: 280, h: 44, label: 'Golden set', sub: 'human-verified questions' },
    { id: 'cases', x: 40, y: 434, w: 280, h: 44, label: 'Denial letters', sub: 'reviewed cases with known answers' },
    { id: 'measure', x: 420, y: 395, w: 300, h: 68, label: 'Measured runs', sub: 'verdict accuracy and cost per case', kind: 'core' },
  ],
  groups: [{ x: 20, y: 350, w: 960, h: 140, label: 'Evaluation' }],
  edges: [
    { from: ['letter', 'r'], to: ['route', 'l'] },
    { from: ['route', 'r'], to: ['invest', 'l'] },
    { from: ['invest', 'r'], to: ['steel', 'l'] },
    { from: ['steel', 'b'], to: ['verdict', 't'] },
    { from: ['verdict', 'l'], to: ['second', 'r'], label: 'checked again' },
    { from: ['verdict', 'b'], to: ['appeal', 't'], label: 'if inconsistent', at: [855, 250], anchor: 'start' },
    { from: ['golden', 'r'], to: ['measure', 'l'] },
    { from: ['cases', 'r'], to: ['measure', 'l'] },
  ],
});

diagram({
  file: 'refreshradar-architecture.svg',
  title: 'RefreshRadar architecture',
  desc: 'A cron job every 15 minutes starts a poller that holds a single-run lease and reads Power BI with a read-only, per-tenant token signed by a certificate whose key stays in Azure Key Vault. Detectors find failed, missing and disabled refreshes. An error classifier tries a deterministic catalog, then a cache, and calls Claude only when both miss. Alerts go through an outbox to email and signed webhooks.',
  height: 450,
  nodes: [
    { id: 'cron', x: 20, y: 40, w: 170, h: 48, label: 'Every 15 minutes' },
    { id: 'kv', x: 20, y: 150, w: 170, h: 48, label: 'Azure Key Vault', kind: 'guard' },
    { id: 'poll', x: 270, y: 34, w: 200, h: 60, label: 'Poller', sub: 'one run at a time', kind: 'core' },
    { id: 'pbi', x: 760, y: 40, w: 220, h: 48, label: 'Power BI', kind: 'human' },
    { id: 'detect', x: 270, y: 200, w: 200, h: 60, label: 'Detectors', sub: 'failed · missing · disabled', kind: 'core' },
    { id: 'classify', x: 530, y: 200, w: 190, h: 60, label: 'Explain the error', sub: 'cheapest answer first', kind: 'core' },
    { id: 'catalog', x: 780, y: 130, w: 200, h: 48, label: '1 · Known-error catalog' },
    { id: 'cache', x: 780, y: 206, w: 200, h: 48, label: '2 · Cache' },
    { id: 'llm', x: 780, y: 282, w: 200, h: 56, label: '3 · Claude', sub: 'only if 1 and 2 miss', kind: 'ai' },
    { id: 'outbox', x: 270, y: 340, w: 200, h: 48, label: 'Alert outbox' },
    { id: 'email', x: 530, y: 330, w: 190, h: 40, label: 'Email' },
    { id: 'hook', x: 530, y: 386, w: 190, h: 40, label: 'Signed webhook' },
  ],
  edges: [
    { from: ['cron', 'r'], to: ['poll', 'l'] },
    { from: ['kv', 'r'], to: ['poll', 'l'], label: 'signs; no secret stored', at: [20, 222], anchor: 'start' },
    { from: ['poll', 'r'], to: ['pbi', 'l'], label: 'read-only, per tenant' },
    { from: ['poll', 'b'], to: ['detect', 't'] },
    { from: ['detect', 'r'], to: ['classify', 'l'] },
    { from: ['classify', 'r'], to: ['catalog', 'l'] },
    { from: ['classify', 'r'], to: ['cache', 'l'] },
    { from: ['classify', 'r'], to: ['llm', 'l'] },
    { from: ['detect', 'b'], to: ['outbox', 't'] },
    { from: ['outbox', 'r'], to: ['email', 'l'] },
    { from: ['outbox', 'r'], to: ['hook', 'l'] },
  ],
});

diagram({
  file: 'talent-scout-pro-architecture.svg',
  title: 'Talent Scout Pro architecture',
  desc: 'Recruiters use a web app backed by a shared database. Searches go through queues: sourcing, evaluation with Claude, then finalizing and notifying, with Redis enforcing distributed rate limits. Platform admins provision a dedicated database per corporate tenant from an admin console through infrastructure as code and migrations.',
  height: 420,
  nodes: [
    { id: 'rec', x: 20, y: 40, w: 160, h: 48, label: 'Recruiter', kind: 'human' },
    { id: 'web', x: 240, y: 34, w: 190, h: 60, label: 'Web app', sub: 'Entra ID sign-in', kind: 'core' },
    { id: 'shared', x: 740, y: 34, w: 240, h: 60, label: 'Shared database', sub: 'serverless Azure SQL', kind: 'core' },
    { id: 'redis', x: 20, y: 186, w: 160, h: 44, label: 'Redis', kind: 'guard' },
    { id: 'source', x: 240, y: 180, w: 190, h: 56, label: 'Find candidates', sub: 'Azure Functions' },
    { id: 'eval', x: 490, y: 180, w: 190, h: 56, label: 'Evaluate', sub: 'Claude scores each fit', kind: 'ai' },
    { id: 'final', x: 740, y: 180, w: 240, h: 56, label: 'Finalize and notify' },
    { id: 'admin', x: 20, y: 336, w: 160, h: 48, label: 'Platform admin', kind: 'human' },
    { id: 'console', x: 240, y: 330, w: 190, h: 60, label: 'Admin console', kind: 'core' },
    { id: 'prov', x: 490, y: 336, w: 190, h: 48, label: 'Infrastructure as code' },
    { id: 'tdb', x: 740, y: 330, w: 240, h: 60, label: 'Dedicated database', sub: 'one per corporate tenant', kind: 'core' },
  ],
  edges: [
    { from: ['rec', 'r'], to: ['web', 'l'] },
    { from: ['web', 'r'], to: ['shared', 'l'] },
    { from: ['web', 'b'], to: ['source', 't'], label: 'queue', at: [345, 142], anchor: 'start' },
    { from: ['source', 'r'], to: ['eval', 'l'], label: 'queue' },
    { from: ['eval', 'r'], to: ['final', 'l'], label: 'queue' },
    { from: ['final', 't'], to: ['shared', 'b'] },
    { from: ['redis', 'r'], to: ['source', 'l'], label: 'rate limits' },
    { from: ['admin', 'r'], to: ['console', 'l'] },
    { from: ['console', 'r'], to: ['prov', 'l'] },
    { from: ['prov', 'r'], to: ['tdb', 'l'] },
  ],
});

diagram({
  file: 'workbench-architecture.svg',
  title: 'Desktop log-analysis workbench architecture',
  desc: 'SQL Server log files go through parsers into an encrypted DuckDB database whose key lives in the operating system keystore. Rules and sampling feed an AI backend, either a local model that runs offline or a cloud model. The AI drafts findings, a person approves them, and only then is a report produced; every approval is written to a hash-chained audit log.',
  height: 460,
  nodes: [
    { id: 'logs', x: 20, y: 40, w: 160, h: 48, label: 'Log files', kind: 'human' },
    { id: 'parse', x: 240, y: 40, w: 180, h: 48, label: 'Parsers' },
    { id: 'duck', x: 480, y: 34, w: 210, h: 60, label: 'Encrypted DuckDB', sub: 'key in the OS keystore', kind: 'core' },
    { id: 'rules', x: 760, y: 40, w: 220, h: 48, label: 'Rules and sampling' },
    { id: 'ai', x: 760, y: 170, w: 220, h: 64, label: 'AI backend', sub: 'local model offline, or cloud', kind: 'ai' },
    { id: 'draft', x: 760, y: 320, w: 220, h: 48, label: 'Draft findings' },
    { id: 'approve', x: 480, y: 314, w: 210, h: 60, label: 'Human approval', sub: 'nothing ships without it', kind: 'human' },
    { id: 'report', x: 240, y: 320, w: 180, h: 48, label: 'Client report' },
    { id: 'chain', x: 480, y: 404, w: 210, h: 44, label: 'Hash-chained audit log', kind: 'guard' },
  ],
  edges: [
    { from: ['logs', 'r'], to: ['parse', 'l'] },
    { from: ['parse', 'r'], to: ['duck', 'l'] },
    { from: ['duck', 'r'], to: ['rules', 'l'] },
    { from: ['rules', 'b'], to: ['ai', 't'] },
    { from: ['ai', 'b'], to: ['draft', 't'] },
    { from: ['draft', 'l'], to: ['approve', 'r'] },
    { from: ['approve', 'l'], to: ['report', 'r'] },
    { from: ['approve', 'b'], to: ['chain', 't'] },
  ],
});

// How I work: the six steps light up one after another, each with a plain-English caption.
const STEPS = [
  ['Decide', 'brainstorm · grill-me', 'Decide: before any code, I get questioned until every open choice has an answer.'],
  ['Plan', 'to-prd · to-issues', 'Plan: the decision becomes a short spec, cut into slices that can each be built and checked alone.'],
  ['Build', 'tdd · parallel-worktrees', 'Build: agents write the test first, then the code, each slice on its own branch so none collide.'],
  ['Prove', 'evaluator · mutation-test', 'Prove: a fresh agent tries to break the work, and tests are broken on purpose to show they can fail.'],
  ['Ship', 'review-triage · safe-merge', 'Ship: only the review findings that matter get fixed, in one round, then the reviewed commit is merged.'],
  ['Learn', 'retrospective · rule-to-hook', 'Learn: every correction becomes a rule, and a rule that keeps getting broken becomes an automatic check.'],
];
const STEP_S = 3.5, CYCLE = STEP_S * STEPS.length, SLOT = 100 / STEPS.length;
const chipW = 150, gap = 12, chipY = 232, chipH = 58;
const chips = STEPS.map(([t, s], i) => {
  const x = 20 + i * (chipW + gap), y = chipY + chipH / 2;
  const arrow = i < STEPS.length - 1
    ? `<path class="edge" d="M${x + chipW} ${y} L${x + chipW + gap - 2} ${y}" marker-end="url(#a)"/>` : '';
  return `<rect class="box" x="${x}" y="${chipY}" width="${chipW}" height="${chipH}" rx="10"/>
  <rect class="hl${i === 0 ? ' hl0' : ''}" style="animation-delay:${i * STEP_S}s" x="${x}" y="${chipY}" width="${chipW}" height="${chipH}" rx="10"/>
  <text class="label" x="${x + chipW / 2}" y="${chipY + 25}" text-anchor="middle">${i + 1} · ${t}</text>
  <text class="sub" style="font-size:11px" x="${x + chipW / 2}" y="${chipY + 44}" text-anchor="middle">${esc(s)}</text>
  ${arrow}`;
}).join('\n  ');
const caps = STEPS.map(([, , c], i) =>
  `<text class="caption cap${i === 0 ? ' cap0' : ''}" style="animation-delay:${i * STEP_S}s" x="500" y="357" text-anchor="middle">${esc(c)}</text>`,
).join('\n  ');
const pct = (n) => `${n.toFixed(2)}%`;
const howExtra = `
  <style>
    /* A step's highlight and caption share one fade: in at its turn, out before the next. */
    .hl { fill: var(--hl-fill); stroke: var(--hl-stroke); stroke-width: 2.5; }
    .hl, .cap { opacity: 0; animation: turn ${CYCLE}s infinite; }
    @keyframes turn { 0% { opacity: 0; } 1.5%, ${pct(SLOT - 2)} { opacity: 1; } ${pct(SLOT - 0.5)}, 100% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) { .hl, .cap { animation: none; } .hl0, .cap0 { opacity: 1; } }
  </style>
  <text class="note" x="20" y="214">Every change moves through these steps, each run by its own skill:</text>
  <rect class="panel" x="20" y="320" width="960" height="64" rx="12"/>
  ${chips}
  ${caps}`;

diagram({
  file: 'how-i-work.svg',
  title: 'How I work with AI agents',
  desc: 'I talk to one orchestrator session that plans and routes work to subagents: readers that search and fact-check, builders that each take one slice, and a fresh evaluator that attacks the result. Hooks check every tool call. Work moves through six steps, each with its own skills: decide (brainstorm, grill-me), plan (to-prd, to-issues), build (tdd, parallel-worktrees), prove (evaluator, mutation-test), ship (review-triage, safe-merge) and learn (retrospective, rule-to-hook).',
  height: 404,
  nodes: [
    { id: 'me', x: 20, y: 70, w: 120, h: 48, label: 'Me', kind: 'human' },
    { id: 'orch', x: 200, y: 64, w: 220, h: 60, label: 'Orchestrator session', sub: 'plans, routes, checks', kind: 'core' },
    { id: 'read', x: 490, y: 14, w: 240, h: 48, label: 'Readers', sub: 'search and fact-check', kind: 'ai' },
    { id: 'build', x: 490, y: 70, w: 240, h: 48, label: 'Builders', sub: 'one slice each, own branch', kind: 'ai' },
    { id: 'evalr', x: 490, y: 126, w: 240, h: 48, label: 'Fresh evaluator', sub: 'never grades its own work', kind: 'ai' },
    { id: 'hooks', x: 790, y: 14, w: 190, h: 160, label: 'Hooks on every step', kind: 'guard',
      lines: ['secrets, wrong cloud account', 'destructive commands', 'tests edited to pass', '"done" without proof'] },
  ],
  edges: [
    { from: ['me', 'r'], to: ['orch', 'l'] },
    { from: ['orch', 'r'], to: ['read', 'l'] },
    { from: ['orch', 'r'], to: ['build', 'l'] },
    { from: ['orch', 'r'], to: ['evalr', 'l'] },
    { from: ['hooks', 'l'], to: ['read', 'r'] },
    { from: ['hooks', 'l'], to: ['build', 'r'] },
    { from: ['hooks', 'l'], to: ['evalr', 'r'] },
  ],
  extra: howExtra,
});
