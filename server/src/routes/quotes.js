import { Router } from 'express';
import { z } from 'zod';
import Quote, { QUOTE_STATUSES } from '../models/Quote.js';
import Inquiry from '../models/Inquiry.js';
import { requireAdmin } from '../middleware/auth.js';
import { makeReference } from '../lib/reference.js';
import { LABELS } from '../lib/brief.js';
import { totals, buildPdf, pdfBuffer } from '../lib/quoteTools.js';
import { mailEnabled, sendMail } from '../lib/mail.js';

const r = Router();
r.use(requireAdmin);
const brand = () => process.env.BRAND_NAME || 'Prince Patel';
const view = (q) => ({ ...q.toObject(), totals: totals(q) });
const find = (id) => Quote.findById(id).populate('inquiry', 'name email phone reference');

r.get('/quotes', async (req, res, next) => {
  try {
    const f = {};
    if (QUOTE_STATUSES.includes(req.query.status)) f.status = req.query.status;
    if (/^[a-f0-9]{24}$/.test(req.query.inquiry || '')) f.inquiry = req.query.inquiry;
    const rows = await Quote.find(f).sort({ createdAt: -1 }).limit(200).populate('inquiry', 'name reference');
    res.json(rows.map(view));
  } catch (e) { next(e); }
});

// Creates a DRAFT only. Prices start at 0 so nothing can be sent by accident.
r.post('/quotes', async (req, res, next) => {
  try {
    const { inquiryId } = z.object({ inquiryId: z.string().regex(/^[a-f0-9]{24}$/) }).parse(req.body);
    const inq = await Inquiry.findById(inquiryId);
    if (!inq) return res.status(404).json({ message: 'Inquiry not found' });
    const lineItems = (inq.services.length ? inq.services : ['other']).map((s) => ({ description: LABELS[s] || s, qty: 1, unitPrice: 0 }));
    const q = await Quote.create({ number: `Q-${makeReference().slice(3)}`, inquiry: inq.id, lineItems });
    res.status(201).json(view(await find(q.id)));
  } catch (e) { next(e); }
});

r.get('/quotes/:id', async (req, res, next) => {
  try { const q = await find(req.params.id); q ? res.json(view(q)) : res.status(404).json({ message: 'Quote not found' }); } catch (e) { next(e); }
});

const body = z.object({
  lineItems: z.array(z.object({ description: z.string().trim().min(1).max(200), qty: z.number().positive().max(10000), unitPrice: z.number().min(0).max(1e9) })).max(30),
  taxPercent: z.number().min(0).max(100).default(0),
  scope: z.string().trim().max(3000).optional(), exclusions: z.string().trim().max(3000).optional(), revisions: z.string().trim().max(500).optional(),
  validUntil: z.coerce.date().nullable().optional(),
});
r.put('/quotes/:id', async (req, res, next) => {
  try {
    const q = await Quote.findById(req.params.id);
    if (!q) return res.status(404).json({ message: 'Quote not found' });
    if (q.status !== 'Draft') return res.status(409).json({ message: 'Only draft quotations can be edited' });
    Object.assign(q, body.parse(req.body));
    await q.save();
    res.json(view(await find(q.id)));
  } catch (e) { next(e); }
});

// Manual status change (for example after sending through WhatsApp, or when the client replies).
r.patch('/quotes/:id/status', async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.enum(QUOTE_STATUSES) }).parse(req.body);
    const q = await Quote.findById(req.params.id);
    if (!q) return res.status(404).json({ message: 'Quote not found' });
    q.status = status;
    if (status === 'Sent' && !q.sentAt) q.sentAt = new Date();
    await q.save();
    res.json(view(await find(q.id)));
  } catch (e) { next(e); }
});

r.get('/quotes/:id/pdf', async (req, res, next) => {
  try {
    const q = await find(req.params.id);
    if (!q) return res.status(404).json({ message: 'Quote not found' });
    res.type('application/pdf').attachment(`${q.number}.pdf`);
    buildPdf(q, q.inquiry, brand()).pipe(res);
  } catch (e) { next(e); }
});

// Only runs when the admin presses Send. Status becomes Sent only after the email really goes out.
r.post('/quotes/:id/send', async (req, res, next) => {
  try {
    const q = await find(req.params.id);
    if (!q) return res.status(404).json({ message: 'Quote not found' });
    if (!mailEnabled()) return res.status(503).json({ message: 'Email is not configured. Download the PDF and send it yourself, then mark it as Sent.' });
    if (!q.inquiry.email) return res.status(400).json({ message: 'This inquiry has no email address' });
    if (!q.lineItems.length || totals(q).total <= 0) return res.status(400).json({ message: 'Add priced line items before sending' });
    if (!q.validUntil) return res.status(400).json({ message: 'Set a validity date before sending' });
    try {
      const pdf = await pdfBuffer(buildPdf(q, q.inquiry, brand()));
      await sendMail({ to: q.inquiry.email, subject: `Quotation ${q.number} from ${brand()}`, text: `Hello ${q.inquiry.name},\n\nPlease find your quotation attached.\n\n${brand()}`, attachments: [{ filename: `${q.number}.pdf`, content: pdf }] });
      Object.assign(q, { status: 'Sent', sentAt: new Date(), emailStatus: 'sent', emailError: undefined });
    } catch (err) {
      console.error(err);
      Object.assign(q, { emailStatus: 'failed', emailError: String(err.message).slice(0, 200) });
      await q.save();
      return res.status(502).json({ message: 'The email could not be sent. The quotation was not marked as Sent.' });
    }
    await q.save();
    res.json(view(q));
  } catch (e) { next(e); }
});

export default r;
