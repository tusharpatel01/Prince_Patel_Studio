import { useEffect } from 'react';
import { site } from '../config/site';

const DEFAULT_DESC = '2D floor plans and 3D house elevations for homes and buildings, tailored to your plot and the way you live.';

function meta(attr, key, value) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!value) return el?.remove();
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', value);
}

// Sets the page title, description, canonical and social tags. title=null means the home/default title.
export function useSeo(title, description, { noindex = false, org = false } = {}) {
  useEffect(() => {
    const full = title ? `${title} | ${site.name}` : site.seoTitle || `${site.name} | ${site.tagline}`;
    const desc = description || site.seoDescription || DEFAULT_DESC;
    document.title = full;
    meta('name', 'description', desc);
    meta('property', 'og:title', full);
    meta('property', 'og:description', desc);
    meta('property', 'og:type', 'website');
    meta('property', 'og:site_name', site.name);
    const url = site.url ? site.url.replace(/\/$/, '') + window.location.pathname : '';
    meta('property', 'og:url', url);
    let link = document.head.querySelector('link[rel="canonical"]');
    if (url) { if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); } link.href = url; } else link?.remove();
    meta('name', 'robots', noindex ? 'noindex, nofollow' : '');
    document.getElementById('ld-json')?.remove();
    if (org) {
      const sameAs = Object.values(site.social || {}).filter(Boolean);
      const s = document.createElement('script');
      s.type = 'application/ld+json'; s.id = 'ld-json';
      // Only facts the owner has entered. Nothing is invented.
      s.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'ProfessionalService', name: site.name, description: desc, url: site.url || undefined, telephone: site.phone || undefined, email: site.email || undefined, sameAs: sameAs.length ? sameAs : undefined });
      document.head.appendChild(s);
    }
  }, [title, description, noindex, org, site.name, site.seoTitle, site.seoDescription, site.url, site.phone, site.email]);
}
