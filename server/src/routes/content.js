import { Router } from 'express';
import { z } from 'zod';
import { Estimator, Package } from '../models/Content.js';
import { estimatorSchema } from '../lib/estimatorSchema.js';
import { requireAdmin } from '../middleware/auth.js';

export const publicRouter = Router();
export const adminRouter = Router();
adminRouter.use(requireAdmin);

// ---- public ----
publicRouter.get('/estimator', async (req, res, next) => {
  try {
    const doc = await Estimator.findOne();
    if (!doc) return res.json({ configured: false, config: estimatorSchema.parse({}), updatedAt: null });
    res.json({ configured: true, config: doc.data, updatedAt: doc.updatedAt });
  } catch (e) { next(e); }
});

publicRouter.get('/packages', async (req, res, next) => {
  try { res.json(await Package.find({ published: true }).sort({ order: 1, createdAt: 1 }).select('-__v')); } catch (e) { next(e); }
});

// ---- admin (screens arrive in Phase 5) ----
adminRouter.put('/estimator', async (req, res, next) => {
  try {
    const data = estimatorSchema.parse(req.body);
    const doc = await Estimator.findOneAndUpdate({}, { data }, { upsert: true, new: true });
    res.json({ configured: true, config: doc.data, updatedAt: doc.updatedAt });
  } catch (e) { next(e); }
});

const list = z.array(z.string().trim().min(1).max(200)).default([]);
const pkg = z.object({
  name: z.string().trim().min(1).max(80),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/).optional(),
  summary: z.string().trim().max(300).optional(),
  quoteOnly: z.boolean().default(true),
  price: z.number().min(0).nullable().optional(),
  currency: z.string().length(3).default('INR'),
  deliverables: list, exclusions: list,
  revisions: z.string().trim().max(120).optional(),
  deliveryRange: z.string().trim().max(120).optional(),
  addons: z.array(z.object({ name: z.string().trim().min(1).max(100), price: z.number().min(0).nullable().optional() })).default([]),
  terms: z.string().trim().max(1000).optional(),
  published: z.boolean().default(false),
  order: z.number().int().default(0),
}).transform((p) => ({ ...p, slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }));

adminRouter.get('/packages', async (req, res, next) => {
  try { res.json(await Package.find().sort({ order: 1, createdAt: 1 })); } catch (e) { next(e); }
});
adminRouter.post('/packages', async (req, res, next) => {
  try { res.status(201).json(await Package.create(pkg.parse(req.body))); }
  catch (e) { e.code === 11000 ? res.status(409).json({ message: 'A package with this slug already exists' }) : next(e); }
});
adminRouter.put('/packages/:id', async (req, res, next) => {
  try {
    const x = await Package.findByIdAndUpdate(req.params.id, pkg.parse(req.body), { new: true });
    x ? res.json(x) : res.status(404).json({ message: 'Package not found' });
  } catch (e) { next(e); }
});
adminRouter.delete('/packages/:id', async (req, res, next) => {
  try {
    const x = await Package.findByIdAndDelete(req.params.id);
    x ? res.json({ ok: true }) : res.status(404).json({ message: 'Package not found' });
  } catch (e) { next(e); }
});
