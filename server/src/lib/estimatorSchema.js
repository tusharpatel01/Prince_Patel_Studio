import { z } from 'zod';

const rate = z.number().positive().nullable().default(null);
export const estimatorSchema = z.object({
  currency: z.string().length(3).default('INR'),
  unit: z.enum(['sqft', 'sqm']).default('sqft'), // unit the rates below are quoted in
  locations: z.array(z.object({ name: z.string().trim().min(1).max(80), rates: z.object({ basic: rate, standard: rate, premium: rate }) })).default([]),
  // percent is a share of the base construction cost. includedInRate=true means the rate already covers it, so it is never added again.
  allowances: z.array(z.object({
    key: z.string().min(1).max(40), label: z.string().min(1).max(80),
    percent: z.number().min(0).max(100), includedInRate: z.boolean().default(false), optional: z.boolean().default(false),
  })).default([]),
  rangeSpreadPercent: z.number().min(0).max(50).default(10),
  assumptions: z.array(z.string().max(300)).default([]),
  included: z.array(z.string().max(200)).default([]),
  excluded: z.array(z.string().max(200)).default([]),
});
