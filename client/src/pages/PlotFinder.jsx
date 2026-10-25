import { useSeo } from '../lib/seo';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import ProjectCard from '../components/ProjectCard';
import { toFeet } from '../data/content';
import { useContent } from '../content/ContentContext';

const empty = { w: '', l: '', unit: 'ft', floors: '', beds: '', style: '', type: '' };
const TOL = 0.2; // plot-size match range: within 20% on each side (configurable later)

export default function PlotFinder() {
  const { projects } = useContent();
  useSeo('Plot-Based Design Finder', 'Find similar house design examples by plot size, floors, bedrooms and style.');
  const [f, setF] = useState(empty);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const w = toFeet(+f.w, f.unit), l = toFeet(+f.l, f.unit);
  const near = (a, b) => Math.abs(a - b) <= b * TOL;
  const active = Object.entries(f).some(([k, v]) => k !== 'unit' && v);
  const list = projects.filter((p) => {
    if (f.w && f.l && p.plotW) {
      const fit = (near(w, p.plotW) && near(l, p.plotL)) || (near(w, p.plotL) && near(l, p.plotW));
      if (!fit) return false;
    } else if ((f.w || f.l) && !p.plotW) return false;
    return (!f.floors || p.floors === +f.floors) && (!f.beds || p.bedrooms === +f.beds) && (!f.style || p.style === f.style) && (!f.type || p.propertyType === f.type);
  });
  const field = 'mt-1 w-full border border-stone bg-white px-3 py-2';
  return (
    <section className="container-x py-16">
      <Breadcrumbs trail={[['Plot-Based Design Finder']]} />
      <h1 className="mt-6 font-display text-5xl md:text-6xl">Plot-Based Design Finder</h1>
      <p className="mt-3 max-w-xl text-muted">Find similar concept examples by plot size and needs. Results are tagged examples, not guaranteed buildable designs, and are not checked against local regulations.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm">Plot width<input type="number" min="0" value={f.w} onChange={set('w')} className={field} /></label>
        <label className="text-sm">Plot length<input type="number" min="0" value={f.l} onChange={set('l')} className={field} /></label>
        <label className="text-sm">Unit<select value={f.unit} onChange={set('unit')} className={field}><option value="ft">Feet</option><option value="m">Meters</option></select></label>
        <label className="text-sm">Floors<select value={f.floors} onChange={set('floors')} className={field}><option value="">Any</option>{[1, 2, 3].map((n) => <option key={n}>{n}</option>)}</select></label>
        <label className="text-sm">Bedrooms<select value={f.beds} onChange={set('beds')} className={field}><option value="">Any</option>{[2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}</select></label>
        <label className="text-sm">Style<select value={f.style} onChange={set('style')} className={field}><option value="">Any</option>{['Modern', 'Contemporary', 'Traditional', 'Minimalist'].map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="text-sm">Property type<select value={f.type} onChange={set('type')} className={field}><option value="">Any</option>{['Independent house', 'Duplex', 'Villa', 'Commercial building'].map((s) => <option key={s}>{s}</option>)}</select></label>
        <div className="flex items-end"><button onClick={() => setF(empty)} className="btn-outline w-full">Clear filters</button></div>
      </div>
      <p className="mt-8 text-sm text-muted" aria-live="polite">{list.length} matching {list.length === 1 ? 'example' : 'examples'}</p>
      {list.length ? (
        <div className="mt-6 grid gap-x-8 gap-y-12 md:grid-cols-3">{list.map((p, i) => <ProjectCard key={p.slug} p={p} i={i} />)}</div>
      ) : (
        <div className="mt-8 border border-stone bg-white p-6">
          <h2 className="font-medium">No example matches these requirements</h2>
          <p className="mt-2 text-sm text-muted">That doesn't mean it can't be designed. Send your plot details and we'll discuss options.</p>
          <Link to="/request-quote" className="btn-primary mt-4">Request a Quote</Link>
        </div>
      )}
      {!active && <p className="mt-6 text-xs text-muted">Showing all examples. Enter your plot size to narrow them down.</p>}
    </section>
  );
}
