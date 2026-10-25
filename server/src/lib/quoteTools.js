import PDFDocument from 'pdfkit';

export const totals = (q) => {
  const subtotal = (q.lineItems || []).reduce((s, i) => s + (i.qty || 0) * (i.unitPrice || 0), 0);
  const tax = (subtotal * (q.taxPercent || 0)) / 100;
  return { subtotal, tax, total: subtotal + tax };
};

// Standard PDF fonts can't draw the rupee sign, so amounts print as "INR 12,000".
const money = (n, c) => `${c} ${Math.round(n).toLocaleString('en-IN')}`;
const date = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-');

export function buildPdf(q, inquiry, brand) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const t = totals(q);
  doc.font('Helvetica-Bold').fontSize(16).text(brand.toUpperCase(), { characterSpacing: 2 });
  doc.font('Helvetica').fontSize(8).fillColor('#77766F').text('ARCHITECTURE & BUILDING DESIGN', { characterSpacing: 1.5 }).fillColor('#252623');
  doc.moveDown(2).font('Helvetica-Bold').fontSize(14).text(q.status === 'Draft' ? 'QUOTATION (DRAFT)' : 'QUOTATION');
  doc.font('Helvetica').fontSize(10).moveDown(0.5)
    .text(`Quote no: ${q.number}`).text(`Prepared for: ${inquiry.name}`).text(`Inquiry ref: ${inquiry.reference}`).text(`Valid until: ${date(q.validUntil)}`);
  doc.moveDown(1.5);
  const y0 = doc.y;
  doc.font('Helvetica-Bold').text('Description', 50, y0).text('Qty', 330, y0, { width: 40, align: 'right' }).text('Rate', 375, y0, { width: 80, align: 'right' }).text('Amount', 460, y0, { width: 85, align: 'right' });
  doc.moveTo(50, doc.y + 4).lineTo(545, doc.y + 4).strokeColor('#D8C8B4').stroke();
  doc.moveDown(0.8).font('Helvetica');
  for (const i of q.lineItems) {
    const y = doc.y;
    doc.text(i.description, 50, y, { width: 270 });
    const h = doc.y;
    doc.text(String(i.qty), 330, y, { width: 40, align: 'right' }).text(money(i.unitPrice, q.currency), 375, y, { width: 80, align: 'right' }).text(money(i.qty * i.unitPrice, q.currency), 460, y, { width: 85, align: 'right' });
    doc.y = Math.max(h, y + 14) + 4;
  }
  doc.moveDown(0.5).text(`Subtotal: ${money(t.subtotal, q.currency)}`, { align: 'right' });
  if (q.taxPercent) doc.text(`Tax (${q.taxPercent}%): ${money(t.tax, q.currency)}`, { align: 'right' });
  doc.font('Helvetica-Bold').fontSize(12).text(`Total: ${money(t.total, q.currency)}`, { align: 'right' }).fontSize(10);
  for (const [label, text] of [['Scope of work', q.scope], ['Exclusions', q.exclusions], ['Revisions', q.revisions]]) {
    if (text) doc.moveDown(1.2).font('Helvetica-Bold').text(label).font('Helvetica').text(text);
  }
  doc.end();
  return doc;
}

export const pdfBuffer = (doc) => new Promise((resolve, reject) => {
  const chunks = [];
  doc.on('data', (c) => chunks.push(c)).on('end', () => resolve(Buffer.concat(chunks))).on('error', reject);
});
