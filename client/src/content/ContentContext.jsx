import { createContext, useContext, useEffect, useState } from 'react';
import { getJson } from '../lib/api';
import { site } from '../config/site';
import { projects as sampleProjects, services as sampleServices, faqs as sampleFaqs } from '../data/content';
import { normalizeProject, normalizeService, normalizeFaq } from './normalize';

const Ctx = createContext(null);
export const useContent = () => useContext(Ctx);

const SAMPLE = { projects: sampleProjects, services: sampleServices, faqs: sampleFaqs, posts: [], testimonials: [], settings: {}, sample: true };

// Uses the owner's published content. Where none exists yet, falls back to the labelled sample concepts.
export function ContentProvider({ children }) {
  const [c, setC] = useState(SAMPLE);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1200); // don't hold the page if the API is slow to wake
    Promise.allSettled(['projects', 'services', 'faqs', 'posts', 'testimonials', 'settings'].map((k) => getJson(`/${k}`))).then((r) => {
      const [pr, sv, fq, po, te, se] = r.map((x) => (x.status === 'fulfilled' ? x.value : null));
      const s = se || {};
      Object.assign(site, {
        ...(s.brandName && { name: s.brandName }), ...(s.phone && { phone: s.phone }), ...(s.email && { email: s.email }),
        ...(s.whatsapp && { whatsapp: s.whatsapp.replace(/\D/g, '') }), ...(s.siteUrl && { url: s.siteUrl }), social: s.social || {}, seoTitle: s.seoTitle || '', seoDescription: s.seoDescription || '',
      });
      setC({
        projects: pr?.length ? pr.map(normalizeProject) : sampleProjects,
        services: sv?.length ? sv.map(normalizeService) : sampleServices,
        faqs: fq?.length ? fq.map(normalizeFaq) : sampleFaqs,
        posts: po || [], testimonials: te || [], settings: s, sample: !pr?.length,
      });
      setReady(true);
    });
    return () => clearTimeout(t);
  }, []);
  return <Ctx.Provider value={c}>{ready ? children : null}</Ctx.Provider>;
}
