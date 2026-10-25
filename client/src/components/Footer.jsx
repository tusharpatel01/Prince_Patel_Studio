import { Link } from 'react-router-dom';
import Wordmark from './Wordmark';
import { site } from '../config/site';

const cols = [
  { title: 'Studio', links: [['/about', 'About'], ['/process', 'Design Process'], ['/pricing', 'Pricing'], ['/faq', 'FAQ']] },
  { title: 'Work', links: [['/services', 'Services'], ['/projects', 'Projects'], ['/floor-plans', '2D Floor Plans'], ['/elevations', '3D Elevations']] },
  { title: 'Resources', links: [['/blog', 'Design Guides'], ['/plot-finder', 'Plot Finder'], ['/budget-estimator', 'Budget Estimator']] },
];

export default function Footer() {
  return (
    <footer className="mt-24 bg-charcoal text-ivory">
      <div className="container-x grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Wordmark light />
          <p className="mt-5 max-w-xs text-sm text-ivory/70">{site.title}</p>
          <div className="mt-5 space-y-1 text-sm text-ivory/70">
            {site.phone && <a className="block hover:text-ivory" href={`tel:${site.phone}`}>{site.phone}</a>}
            {site.email && <a className="block hover:text-ivory" href={`mailto:${site.email}`}>{site.email}</a>}
            {Object.entries(site.social || {}).filter(([, v]) => v).map(([k, v]) => <a key={k} href={v} target="_blank" rel="noopener noreferrer" className="block capitalize hover:text-ivory">{k}</a>)}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h3 className="text-sm font-medium text-stone">{c.title}</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {c.links.map(([to, label]) => (
                <li key={to}><Link className="text-ivory/70 hover:text-ivory" to={to}>{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-ivory/15">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-ivory/60 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p className="flex gap-5">
            <Link to="/privacy" className="hover:text-ivory">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-ivory">Terms and Conditions</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
