import { z } from 'zod';

export const SERVICES = ['2d-floor-plan', '3d-front-elevation', '3d-interior-visualization', 'residential-design', 'commercial-design', 'design-consultation', 'other'];

// Strip tags and control characters, collapse whitespace.
const clean = (max) => z.string().trim().max(max).transform((s) => s.replace(/<[^>]*>/g, '').replace(/[\u0000-\u0008\u000B-\u001F]/g, '').trim());
const blank = (v) => (v === '' || v === null ? undefined : v);
const opt = (max) => z.preprocess(blank, clean(max).optional());
const num = (min, max) => z.preprocess(blank, z.coerce.number().min(min).max(max).optional());

export const inquirySchema = z.object({
  source: z.enum(['quote', 'contact', 'builder']).default('quote'),
  name: clean(80).pipe(z.string().min(2, 'Enter your name')),
  phone: z.string().transform((s) => s.replace(/[\s\-()]/g, '')).pipe(z.string().regex(/^\+?\d{7,15}$/, 'Enter a valid phone number')),
  email: z.preprocess(blank, z.string().trim().toLowerCase().email('Enter a valid email').max(120).optional()),
  location: opt(120),
  propertyType: opt(60),
  plotWidth: num(1, 100000),
  plotLength: num(1, 100000),
  unit: z.enum(['ft', 'm']).default('ft'),
  floors: num(1, 20),
  bedrooms: num(0, 30),
  bathrooms: num(0, 30),
  roadFacing: opt(30),
  style: opt(40),
  requirements: opt(800),
  services: z.array(z.string().regex(/^[a-z0-9-]{1,60}$/)).max(12).default([]),
  budget: opt(60),
  timeline: opt(60),
  preferredContact: opt(30),
  message: opt(2000),
  consent: z.literal(true, { message: 'Please accept the privacy notice' }),
  website: z.string().optional(), // honeypot: real users never fill this
}).superRefine((d, ctx) => {
  if (d.source !== 'contact') {
    if (!d.location) ctx.addIssue({ code: 'custom', path: ['location'], message: 'Enter your city or project location' });
    if (!d.services.length) ctx.addIssue({ code: 'custom', path: ['services'], message: 'Choose at least one service' });
  } else if (!d.message) ctx.addIssue({ code: 'custom', path: ['message'], message: 'Write a short message' });
});
