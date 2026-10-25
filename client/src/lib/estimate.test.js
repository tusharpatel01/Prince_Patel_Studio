import test from 'node:test';
import assert from 'node:assert/strict';
import { estimate } from './estimate.js';

const cfg = { unit: 'sqft', rangeSpreadPercent: 10, locations: [{ name: 'Testville', rates: { basic: 1000, standard: 2000, premium: null } }],
  allowances: [{ key: 'fin', label: 'Finishing', percent: 15, includedInRate: true, optional: false }, { key: 'site', label: 'Site', percent: 5, includedInRate: false, optional: true }, { key: 'cont', label: 'Contingency', percent: 10, includedInRate: false, optional: false }] };
const run = (o) => estimate({ area: 1000, areaUnit: 'sqft', tier: 'standard', config: cfg, city: 'testville', selected: [], ...o });

test('base is area x rate; included allowances are never added twice', () => {
  const r = run({});
  assert.equal(r.base, 2000000); assert.equal(r.total, 2200000);
  assert.equal(r.items.find((i) => i.label === 'Finishing').amount, 0);
});
test('optional allowances only when chosen', () => assert.equal(run({ selected: ['site'] }).total, 2300000));
test('range spread', () => { const r = run({}); assert.equal(Math.round(r.low), 1980000); assert.equal(Math.round(r.high), 2420000); });
test('square metres are converted to the configured unit', () => assert.equal(Math.round(run({ area: 100, areaUnit: 'sqm', tier: 'basic' }).base), 1076390));
test('no estimate when the rate is missing, unless the visitor supplies one', () => {
  assert.equal(run({ tier: 'premium' }), null);
  assert.equal(run({ city: 'Nowhere' }), null);
  assert.equal(run({ city: 'Nowhere', customRate: 500, area: 10 }).base, 5000);
});
