const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

const source = readFileSync(join(__dirname, '../app-release.js'), 'utf8');
const html = readFileSync(join(__dirname, '../index.html'), 'utf8');
const releaseAt = html.match(/data-release-at="([^"]+)"/)[1];
const launch = Date.parse(releaseAt);

function visit(now, timestamp = releaseAt) {
  const badge = { src: 'pre-order.svg', alt: 'Pre-order on the App Store', width: 118 };
  const note = { hidden: false };
  const timers = [];
  const clock = { now };
  const card = {
    dataset: { releaseAt: timestamp },
    querySelector: (selector) => selector === '.app-store-badge' ? badge : note,
  };
  vm.runInNewContext(source, {
    Date: { parse: Date.parse, now: () => clock.now },
    document: { querySelectorAll: () => [card] },
    window: { setTimeout: (callback, delay) => timers.push({ callback, delay }) },
  });
  return { badge, note, timers, clock };
}

function assertReleased(state) {
  assert.equal(state.badge.src, 'https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg');
  assert.equal(state.badge.alt, 'Download on the App Store');
  assert.equal(state.badge.width, 120);
  assert.equal(state.note.hidden, true);
}

test('Reach launches at midnight UK time, preserving pre-order until the boundary', () => {
  assert.equal(new Date(launch).toISOString(), '2026-10-22T23:00:00.000Z');
  const state = visit(launch - 1);
  assert.equal(state.badge.alt, 'Pre-order on the App Store');
  assert.equal(state.note.hidden, false);
  assert.equal(state.timers[0].delay, 1);
});

test('shows download badge at and after launch', () => {
  assertReleased(visit(launch));
  assertReleased(visit(launch + 86400000));
});

test('an open page switches when launch time arrives', () => {
  const state = visit(launch - 60000);
  assert.equal(state.timers[0].delay, 60000);
  state.clock.now = launch;
  state.timers.shift().callback();
  assertReleased(state);
  assert.equal(state.timers.length, 0);
});

test('long waits stay within the browser timeout limit', () => {
  const state = visit(launch - 3000000000);
  assert.equal(state.timers[0].delay, 2147483647);
  assert.equal(state.note.hidden, false);
});

test('invalid release timestamps leave the pre-order intact', () => {
  const state = visit(launch, 'invalid');
  assert.equal(state.badge.alt, 'Pre-order on the App Store');
  assert.equal(state.note.hidden, false);
  assert.equal(state.timers.length, 0);
});
