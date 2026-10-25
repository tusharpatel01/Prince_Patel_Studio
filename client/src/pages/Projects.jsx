import { useSeo } from '../lib/seo';
import { useState } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import ProjectCard from '../components/ProjectCard';
import { plotLabel } from '../data/content';
import { useContent } from '../content/ContentContext';

const filters = {
  'All Projects': () => true,
  '2D Plans': (p) => p.gallery.some((g) => g.kind === 'plan'),
  '3D Elevations': (p) => p.gallery.some((g) => g.kind === 'elevation'),
  Residential: (p) => p.category === 'Residential',
  Commercial: (p) => p.category === 'Commercial',
  'Interior Concepts': (p) => p.category === 'Interior',
  Modern: (p) => p.style === 'Modern',
  Contemporary: (p) => p.style === 'Contemporary',
  Traditional: (p) => p.style === 'Traditional',
  Minimalist: (p) => p.style === 'Minimalist',
};

export default function Projects() {
  const { projects, sample } = useContent();
  useSeo('Projects', 'Browse house design examples with floor plans and 3D elevations, filtered by style and plot size.');
  const [f, setF] = useState('All Projects');
  const [q, setQ] = useState('');
  const norm = (t) => t.toLowerCase().replace(/[×x]/g, 'x').replace(/\s+/g, '');
  const list = projects.filter((p) => filters[f](p) && (!q || norm(`${p.title} ${plotLabel(p)}`).includes(norm(q))));
  return (
    <section className="container-x py-16">
      <Breadcrumbs trail={[['Projects']]} />
      <h1 className="mt-6 font-display text-5xl md:text-6xl">Projects</h1>
      {sample && <p className="mt-3 text-sm text-muted">These are concept designs shown as examples.</p>}
      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter projects">
        {Object.keys(filters).map((k) => (
          <button key={k} aria-pressed={f === k} onClick={() => setF(k)} className={`border px-3 py-1.5 text-sm ${f === k ? 'border-charcoal bg-charcoal text-ivory' : 'border-stone text-muted hover:border-charcoal'}`}>{k}</button>
        ))}
      </div>
      <label className="mt-6 block max-w-sm text-sm">Search by title or plot size
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. 30 x 40" className="mt-1 w-full border border-stone bg-white px-3 py-2" />
      </label>
      <p className="mt-6 text-sm text-muted" aria-live="polite">{list.length} {list.length === 1 ? 'project' : 'projects'}</p>
      {list.length ? (
        <div className="mt-6 grid gap-x-8 gap-y-12 md:grid-cols-3">{list.map((p, i) => <ProjectCard key={p.slug} p={p} i={i} />)}</div>
      ) : (
        <p className="mt-10 text-muted">No projects match. Clear the search or choose another filter.</p>
      )}
    </section>
  );
}
