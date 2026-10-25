// Offline tests: no database needed. Run with `npm test`.
process.env.MONGODB_URI = 'mongodb://127.0.0.1:1/test';
process.env.JWT_SECRET = 'a'.repeat(40);
process.env.CLIENT_ORIGIN = 'http://localhost:5173';
import test from 'node:test';
import assert from 'node:assert/strict';

const { default: app } = await import('../src/app.js');
const { inquirySchema } = await import('../src/lib/schema.js');
const { makeBrief } = await import('../src/lib/brief.js');
const { makeReference } = await import('../src/lib/reference.js');
const { totals, buildPdf, pdfBuffer } = await import('../src/lib/quoteTools.js');
const { estimatorSchema } = await import('../src/lib/estimatorSchema.js');
const { schemas } = await import('../src/routes/cms.js');

const good = { name: 'Asha <b>K</b>', phone: '+91 98765-43210', location: 'Delhi', services: ['2d-floor-plan'], consent: true };

test('inquiry: cleans and normalizes input', () => {
  const d = inquirySchema.parse({ ...good, plotWidth: '30', floors: '' });
  assert.equal(d.name, 'Asha K'); assert.equal(d.phone, '+919876543210'); assert.equal(d.plotWidth, 30); assert.equal(d.floors, undefined);
});
test('inquiry: rejects missing consent, bad phone and missing services', () => {
  const r = inquirySchema.safeParse({ name: 'A', phone: '12', services: [], consent: false });
  assert.equal(r.success, false);
  assert.deepEqual(Object.keys(r.error.flatten().fieldErrors).sort(), ['consent', 'name', 'phone']);
});
test('inquiry: contact source needs a message, not services', () => {
  assert.equal(inquirySchema.safeParse({ source: 'contact', name: 'Asha', phone: '9876543210', consent: true }).success, false);
  assert.equal(inquirySchema.safeParse({ source: 'contact', name: 'Asha', phone: '9876543210', consent: true, message: 'Hi' }).success, true);
});
test('brief leaves contact details out', () => {
  const b = makeBrief(inquirySchema.parse({ ...good, propertyType: 'Duplex', plotWidth: 30, plotLength: 40, floors: 2 }));
  assert.match(b, /Duplex in Delhi/); assert.match(b, /30 x 40 ft/); assert.doesNotMatch(b, /9876|Asha/);
});
test('reference format', () => assert.match(makeReference(), /^PP-\d{8}-[A-Z2-9]{4}$/));
test('quote totals and PDF', async () => {
  const q = { number: 'Q-1', status: 'Draft', currency: 'INR', taxPercent: 18, validUntil: new Date(), lineItems: [{ description: 'Plan', qty: 1, unitPrice: 10000 }, { description: 'Elevation', qty: 2, unitPrice: 5000 }] };
  assert.deepEqual(totals(q), { subtotal: 20000, tax: 3600, total: 23600 });
  assert.equal((await pdfBuffer(buildPdf(q, { name: 'Asha', reference: 'PP-1' }, 'Brand'))).slice(0, 5).toString(), '%PDF-');
});
test('estimator settings: rates default to null, never invented', () => {
  const e = estimatorSchema.parse({ locations: [{ name: 'X', rates: {} }] });
  assert.equal(e.locations[0].rates.basic, null);
});
test('content: slug is generated; testimonials need permission', () => {
  assert.equal(schemas.posts.parse({ title: 'How to Plan a 30 × 40 ft House' }).slug, 'how-to-plan-a-30-40-ft-house');
  assert.equal(schemas.testimonials.safeParse({ name: 'A', text: 't', published: true, permission: false }).success, false);
  assert.equal(schemas.testimonials.safeParse({ name: 'A', text: 't', published: true, permission: true }).success, true);
  assert.equal(schemas.projects.safeParse({ title: 'x', category: 'Nope' }).success, false);
});
test('http: admin routes need sign-in, other origins are refused', async () => {
  const s = app.listen(0); const u = `http://localhost:${s.address().port}`;
  try {
    for (const [m, p] of [['GET', '/api/admin/stats'], ['GET', '/api/admin/inquiries'], ['PUT', '/api/admin/settings'], ['POST', '/api/admin/media'], ['GET', '/api/admin/quotes/x/pdf']]) assert.equal((await fetch(u + p, { method: m })).status, 401, `${m} ${p}`);
    assert.equal((await fetch(u + '/api/inquiries', { method: 'POST', headers: { Origin: 'https://evil.example' } })).status, 403);
    assert.equal((await fetch(u + '/api/health')).status, 200);
  } finally { s.close(); }
});
