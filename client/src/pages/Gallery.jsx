import { useSeo } from '../lib/seo';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import Art from '../components/Art';
import Lightbox from '../components/Lightbox';
import { useContent } from '../content/ContentContext';

export default function Gallery({ kind, title, intro }) {
  const { projects, sample } = useContent();
  useSeo(title, intro);
  const [open, setOpen] = useState(null);
  const items = projects.flatMap((p) => p.gallery.map((g, i) => ({ ...g, floors: p.floors, seed: i, project: p }))).filter((g) => g.kind === kind);
  return (
    <section className="container-x py-16">
      <Breadcrumbs trail={[[title]]} />
      <h1 className="mt-6 font-display text-5xl md:text-6xl">{title}</h1>
      <p className="mt-3 max-w-xl text-muted">{intro}{sample && ' All examples are concept designs.'}</p>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <figure key={i}>
            <button onClick={() => setOpen(i)} className="block w-full" aria-label={`Open ${it.project.title}: ${it.caption}`}>
              <div className="aspect-[4/3] border border-stone"><Art kind={it.kind} url={it.url} floors={it.floors} seed={it.seed} label={it.caption || it.project.title} /></div>
            </button>
            <figcaption className="mt-2 text-sm"><Link to={`/projects/${it.project.slug}`} className="underline underline-offset-4">{it.project.title}</Link><span className="text-muted"> · {it.caption}</span></figcaption>
          </figure>
        ))}
      </div>
      {open !== null && <Lightbox items={items.map((x) => ({ ...x, caption: `${x.project.title}: ${x.caption}` }))} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </section>
  );
}
