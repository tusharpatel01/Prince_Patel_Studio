import { Router } from 'express';
import { z } from 'zod';
import Inquiry, { STATUSES } from '../models/Inquiry.js';
import { requireAdmin } from '../middleware/auth.js';

const r = Router();
r.use(requireAdmin);

const esc = (s) => String(s ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const buildFilter = (q) => {
  const f = { archived: q.archived === 'true' };
  if (STATUSES.includes(q.status)) f.status = q.status;
  if (q.q) { const rx = new RegExp(esc(q.q), 'i'); f.$or = [{ name: rx }, { phone: rx }, { reference: rx }, { location: rx }]; }
  return f;
};

r.get('/inquiries', async (req, res, next) => {
  try {
    const page = Math.max(1, +req.query.page || 1), limit = 20;
    const filter = buildFilter(req.query);
    const [items, total] = await Promise.all([
      Inquiry.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).select('-notes'),
      Inquiry.countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (e) { next(e); }
});

// Defined before /:id so "export.csv" isn't read as an id. Private notes are never exported.
r.get('/inquiries/export.csv', async (req, res, next) => {
  try {
    const rows = await Inquiry.find(buildFilter(req.query)).sort({ createdAt: -1 }).select('-notes -files');
    const cols = ['reference', 'createdAt', 'name', 'phone', 'email', 'location', 'propertyType', 'plotWidth', 'plotLength', 'unit', 'floors', 'bedrooms', 'bathrooms', 'style', 'services', 'budget', 'timeline', 'status', 'followUpDate', 'message'];
    const cell = (v) => {
      let s = Array.isArray(v) ? v.join('; ') : v instanceof Date ? v.toISOString() : String(v ?? '');
      if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // blocks spreadsheet formula injection
      return `"${s.replace(/"/g, '""')}"`;
    };
    const csv = [cols.join(','), ...rows.map((x) => cols.map((c) => cell(x[c])).join(','))].join('\n');
    res.type('text/csv').attachment('inquiries.csv').send(csv);
  } catch (e) { next(e); }
});

r.get('/inquiries/:id', async (req, res, next) => {
  try {
    const x = await Inquiry.findById(req.params.id);
    x ? res.json(x) : res.status(404).json({ message: 'Inquiry not found' });
  } catch (e) { next(e); }
});

const patch = z.object({ status: z.enum(STATUSES).optional(), followUpDate: z.coerce.date().nullable().optional(), archived: z.boolean().optional() });
r.patch('/inquiries/:id', async (req, res, next) => {
  try {
    const x = await Inquiry.findByIdAndUpdate(req.params.id, patch.parse(req.body), { new: true });
    x ? res.json(x) : res.status(404).json({ message: 'Inquiry not found' });
  } catch (e) { next(e); }
});

r.post('/inquiries/:id/notes', async (req, res, next) => {
  try {
    const { text } = z.object({ text: z.string().trim().min(1).max(2000) }).parse(req.body);
    const x = await Inquiry.findByIdAndUpdate(req.params.id, { $push: { notes: { text } } }, { new: true });
    x ? res.json(x) : res.status(404).json({ message: 'Inquiry not found' });
  } catch (e) { next(e); }
});

export default r;
