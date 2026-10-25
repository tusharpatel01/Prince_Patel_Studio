import { useSeo } from '../lib/seo';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import Art from '../components/Art';
import Lightbox from '../components/Lightbox';
import ProjectCard from '../components/ProjectCard';
import NotFound from './NotFound';
import { plotLabel } from '../data/content';
import { useContent } from '../content/ContentContext';

export default function ProjectDetail({ preview }) {
  const { projects } = useContent();
  const { slug } = useParams();
  const [open, setOpen] = useState(null);
  const p = preview || projects.find((x) => x.slug === slug);
  useSeo(p?.title, p?.desc, { noindex: !!preview });
  if (!p) return <NotFound />;
  const items = p.gallery.map((g, i) => ({ ...g, floors: p.floors, seed: i }));
  const related = projects.filter((x) => x.slug !== p.slug && (x.category === p.category || x.style === p.style)).slice(0, 3);
  const facts = [['Category', p.category], ['Plot', plotLabel(p)], ['Floors', p.floors], ['Style', p.style], ['Status', p.status]];
  return (
    <article className="container-x py-16">
      <Breadcrumbs trail={[['Projects', '/projects'], [p.title]]} />
      <h1 className="mt-6 font-display text-5xl md:text-6xl">{p.title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">{p.desc}</p>
      <dl className="mt-8 grid grid-cols-2 gap-4 border-y border-stone py-5 md:grid-cols-5">
        {facts.map(([k, v]) => (<div key={k}><dt className="text-xs text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>))}
      </dl>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {items.map((it, i) => (
          <button key={i} onClick={() => setOpen(i)} className="text-left" aria-label={`Open ${it.caption}`}>
            <div className="aspect-[4/3] border border-stone"><Art kind={it.kind} url={it.url} floors={it.floors} seed={it.seed} label={it.caption || p.title} /></div>
            <p className="mt-2 text-sm text-muted">{it.caption}</p>
          </button>
        ))}
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <div className="border-t border-stone pt-4"><h2 className="font-medium">Design requirements</h2><ul className="mt-3 space-y-1 text-sm text-muted">{p.requirements.map((r) => <li key={r}>{r}</li>)}</ul></div>
        <div className="border-t border-stone pt-4"><h2 className="font-medium">Design highlights</h2><ul className="mt-3 space-y-1 text-sm text-muted">{p.highlights.map((r) => <li key={r}>{r}</li>)}</ul></div>
      </div>
      <Link to={`/request-quote?project=${p.slug}`} className="btn-primary mt-10">Request a Similar Design</Link>
      {related.length > 0 && (<div className="mt-16"><h2 className="font-display text-3xl">Related projects</h2><div className="mt-6 grid gap-8 md:grid-cols-3">{related.map((r, i) => <ProjectCard key={r.slug} p={r} i={i} />)}</div></div>)}
      {open !== null && <Lightbox items={items} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </article>
  );
}
