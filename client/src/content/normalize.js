// Turns database records into the shapes the public pages already use.
export const normalizeProject = (p) => ({
  ...p,
  desc: p.description || '',
  plotW: p.plotWidth || 0, plotL: p.plotLength || 0,
  floors: p.floors || 1, bedrooms: p.bedrooms || 0,
  highlights: p.highlights || [], requirements: p.requirements || [],
  gallery: (p.images || []).map((i) => ({ kind: i.kind || 'elevation', caption: i.caption || '', url: i.url })),
});
export const normalizeService = (s) => ({ ...s, art: s.art || 'plan', short: s.short || '', desc: s.desc || '', faqs: (s.faqs || []).map((f) => [f.q, f.a]) });
export const normalizeFaq = (f) => [f.question, f.answer];
