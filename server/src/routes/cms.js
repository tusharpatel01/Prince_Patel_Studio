import { Router } from 'express';
import { z } from 'zod';
import { Project, Service, Faq, Testimonial, Post, Settings } from '../models/Cms.js';
import { requireAdmin } from '../middleware/auth.js';

export const publicCms = Router();
export const adminCms = Router();
adminCms.use(requireAdmin);

const str = (n) => z.string().trim().max(n);
const lines = z.array(str(300)).max(40).default([]);
const num = z.number().nullable().optional();
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
const slug = z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/).optional();
const base = { published: z.boolean().default(false), order: z.number().int().default(0) };
const withSlug = (key) => (d) => ({ ...d, slug: d.slug || slugify(d[key]) || 'item' });

export const schemas = {
  projects: z.object({
    title: str(120).min(1), slug, category: z.enum(['Residential', 'Commercial', 'Interior']), propertyType: str(60).optional(), style: str(40).optional(),
    plotWidth: num, plotLength: num, unit: z.enum(['ft', 'm']).default('ft'), floors: num, bedrooms: num,
    status: z.enum(['Concept', 'In Progress', 'Completed']).default('Concept'), description: str(3000).optional(),
    highlights: lines, requirements: lines, tags: lines,
    images: z.array(z.object({ url: z.string().url().max(500), caption: str(200).optional(), kind: z.enum(['plan', 'elevation', 'interior', 'sketch']).default('elevation') })).max(40).default([]),
    coverIndex: z.number().int().min(0).default(0), ...base,
  }).transform(withSlug('title')),
  services: z.object({
    title: str(120).min(1), slug, art: z.enum(['plan', 'elevation', 'interior']).default('plan'), short: str(300).optional(), desc: str(3000).optional(),
    suitable: lines, deliverables: lines, prepare: lines,
    faqs: z.array(z.object({ q: str(300).min(1), a: str(1500).min(1) })).max(20).default([]), ...base,
  }).transform(withSlug('title')),
  faqs: z.object({ question: str(300).min(1), answer: str(2000).min(1), ...base }),
  testimonials: z.object({ name: str(80).min(1), role: str(120).optional(), text: str(1500).min(1), permission: z.boolean().default(false), ...base })
    .refine((t) => !t.published || t.permission, { message: 'Only publish a testimonial once you have the person\'s permission', path: ['published'] }),
  posts: z.object({ title: str(160).min(1), slug, excerpt: str(300).optional(), body: str(20000).optional(), ...base }).transform(withSlug('title')),
  settings: z.object({
    brandName: str(80).optional(), phone: str(30).optional(), email: z.union([z.literal(''), z.string().trim().email()]).optional(),
    whatsapp: str(20).optional(), siteUrl: z.union([z.literal(''), z.string().trim().url()]).optional(), currency: str(3).optional(),
    social: z.object(Object.fromEntries(['instagram', 'facebook', 'linkedin', 'youtube'].map((k) => [k, z.union([z.literal(''), z.string().trim().url()]).optional()]))).default({}),
    aboutText: str(4000).optional(), seoTitle: str(70).optional(), seoDescription: str(170).optional(),
  }),
};

function crud(path, Model, schema, { sort = { order: 1, createdAt: 1 }, bySlug = false, hide = '-__v', hook } = {}) {
  const guard = (res, e, next) => (e.code === 11000 ? res.status(409).json({ message: 'That slug is already used. Change the title or slug.' }) : next(e));
  publicCms.get(`/${path}`, async (req, res, next) => { try { res.json(await Model.find({ published: true }).sort(sort).select(hide)); } catch (e) { next(e); } });
  if (bySlug) publicCms.get(`/${path}/:slug`, async (req, res, next) => { try { const x = await Model.findOne({ slug: req.params.slug, published: true }).select('-__v'); x ? res.json(x) : res.status(404).json({ message: 'Not found' }); } catch (e) { next(e); } });
  adminCms.get(`/${path}`, async (req, res, next) => { try { res.json(await Model.find().sort(sort)); } catch (e) { next(e); } });
  adminCms.post(`/${path}`, async (req, res, next) => {
    try { const d = schema.parse(req.body); hook?.(d, null); res.status(201).json(await Model.create(d)); } catch (e) { guard(res, e, next); }
  });
  adminCms.put(`/${path}/:id`, async (req, res, next) => {
    try {
      const doc = await Model.findById(req.params.id);
      if (!doc) return res.status(404).json({ message: 'Not found' });
      const d = schema.parse(req.body); hook?.(d, doc); doc.set(d); await doc.save(); res.json(doc);
    } catch (e) { guard(res, e, next); }
  });
  adminCms.delete(`/${path}/:id`, async (req, res, next) => {
    try { const x = await Model.findByIdAndDelete(req.params.id); x ? res.json({ ok: true }) : res.status(404).json({ message: 'Not found' }); } catch (e) { next(e); }
  });
}

crud('projects', Project, schemas.projects);
crud('services', Service, schemas.services);
crud('faqs', Faq, schemas.faqs);
crud('testimonials', Testimonial, schemas.testimonials);
crud('posts', Post, schemas.posts, { sort: { publishedAt: -1, createdAt: -1 }, bySlug: true, hide: '-body -__v', hook: (d, old) => { if (d.published && !old?.publishedAt) d.publishedAt = new Date(); } });

publicCms.get('/settings', async (req, res, next) => { try { res.json((await Settings.findOne())?.data || {}); } catch (e) { next(e); } });
adminCms.put('/settings', async (req, res, next) => {
  try { const data = schemas.settings.parse(req.body); res.json((await Settings.findOneAndUpdate({}, { data }, { upsert: true, new: true })).data); } catch (e) { next(e); }
});
