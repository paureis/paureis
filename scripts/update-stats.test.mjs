import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyStats, parseBadges } from './update-stats.mjs';

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
