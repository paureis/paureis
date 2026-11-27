import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyBlock, applyStats, parseBadges, renderShippingLog } from './update-stats.mjs';

const rel = (repo, tag, date, extra = {}) => ({ repo, tag_name: tag, published_at: `${date}T10:00:00Z`, html_url: `https://x/${tag}`, draft: false, prerelease: false, ...extra });

const NOW = new Date('2026-11-27T12:00:00Z');

test('shipping log: one row per project, most recent first, skipping drafts and prereleases', () => {
  const log = renderShippingLog([
    rel('cloudpin', 'v1.2.3', '2026-11-05'),
    rel('pau-skills', 'v0.26.0', '2026-11-26'),
    rel('pau-skills', 'v0.27.0', '2026-11-27'),
    rel('pau-skills', 'v0.28.0-rc', '2026-11-28', { prerelease: true }),
    rel('cloudpin', 'v2.0.0', '2026-11-29', { draft: true }),
  ], NOW);
  const rows = log.split('\n').slice(2);
  assert.equal(rows.length, 2);
  assert.match(rows[0], /pau-skills.*v0\.27\.0.*2026-11-27 \| 2 \|/);
  assert.match(rows[1], /cloudpin.*v1\.2\.3.*2026-11-05 \| 1 \|/);
});

test('releases older than 30 days still show as latest but are not counted as recent', () => {
  const rows = renderShippingLog([rel('cloudpin-action', 'v1.0.0', '2026-10-20')], NOW).split('\n').slice(2);
  assert.match(rows[0], /v1\.0\.0.*2026-10-20 \| 0 \|/);
});

test('a block is replaced between its markers, and the markers stay', () => {
  const out = applyBlock('a\n<!--shipping:start-->\nold\n<!--shipping:end-->\nb', 'shipping', 'new');
  assert.equal(out, 'a\n<!--shipping:start-->\nnew\n<!--shipping:end-->\nb');
  assert.equal(applyBlock(out, 'shipping', 'new'), out);
});

test('a missing block is an error', () => {
  assert.throws(() => applyBlock('nothing', 'shipping', 'x'), /shipping:start/);
});

test('reads skill and hook counts from the badges', () => {
  const readme = '![Skills: 41](https://img.shields.io/badge/skills-41-informational)\n![Hooks: 16](https://img.shields.io/badge/hooks-16-informational)';
  assert.deepEqual(parseBadges(readme), { skills: 41, hooks: 16 });
});

test('a missing badge is an error, not a zero', () => {
  assert.throws(() => parseBadges('![Skills: 41](https://img.shields.io/badge/skills-41-informational)'), /hooks badge/);
});

test('replaces every copy of a marker and leaves the rest alone', () => {
  const readme = 'a <!--stat:skills-->40<!--/stat--> b <!--stat:hooks-->15<!--/stat--> c <!--stat:skills-->40<!--/stat-->';
  assert.equal(applyStats(readme, { skills: 41, hooks: 16 }),
    'a <!--stat:skills-->41<!--/stat--> b <!--stat:hooks-->16<!--/stat--> c <!--stat:skills-->41<!--/stat-->');
});

test('unchanged numbers give back the same text', () => {
  const readme = 'x <!--stat:skills-->41<!--/stat-->';
  assert.equal(applyStats(readme, { skills: 41 }), readme);
});

test('a marker missing from the README is an error', () => {
  assert.throws(() => applyStats('no markers here', { skills: 41 }), /stat:skills/);
});
