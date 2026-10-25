// Runs before every build: writes public/sitemap.xml and public/robots.txt.
// Reads SITE_URL and API_URL from the environment (or client/.env). Never fails the build.
import fs from 'fs';

const env = { ...process.env };
try {
  for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch { /* no .env file */ }

const site = (env.SITE_URL || '').replace(/\/$/, '');
const api = (env.API_URL || '').replace(/\/$/, '');
fs.mkdirSync('public', { recursive: true });

if (!/^https?:\/\//.test(site)) {
  fs.writeFileSync('public/robots.txt', 'User-agent: *\nDisallow: /admin\n');
  console.warn('[seo] SITE_URL is not set, so no sitemap was written. Set it to your live site URL.');
} else {
  const fixed = ['/', '/services', '/projects', '/floor-plans', '/elevations', '/plot-finder', '/requirement-builder', '/budget-estimator', '/about', '/process', '/pricing', '/faq', '/blog', '/contact', '/request-quote', '/privacy', '/terms'];
  const get = async (k) => {
    if (!/^https?:\/\//.test(api)) return [];
    try { const r = await fetch(`${api}/${k}`, { signal: AbortSignal.timeout(8000) }); return r.ok ? await r.json() : []; } catch { return []; }
  };
  const [projects, services, posts] = await Promise.all([get('projects'), get('services'), get('posts')]);
  const paths = [...fixed, ...projects.map((p) => `/projects/${p.slug}`), ...services.map((s) => `/services/${s.slug}`), ...posts.map((p) => `/blog/${p.slug}`)];
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  fs.writeFileSync('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((p) => `  <url><loc>${esc(site + p)}</loc></url>`).join('\n')}\n</urlset>\n`);
  fs.writeFileSync('public/robots.txt', `User-agent: *\nDisallow: /admin\n\nSitemap: ${site}/sitemap.xml\n`);
  console.log(`[seo] sitemap.xml written with ${paths.length} URLs (${projects.length} projects, ${services.length} services, ${posts.length} guides).`);
}
