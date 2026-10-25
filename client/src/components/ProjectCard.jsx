import { Link } from 'react-router-dom';
import Art from './Art';
import { plotLabel } from '../data/content';

export default function ProjectCard({ p, i = 0 }) {
  const cover = (p.coverIndex != null && p.gallery[p.coverIndex]) || p.gallery.find((g) => g.kind === 'elevation') || p.gallery[0] || { kind: 'elevation' };
  return (
    <Link to={`/projects/${p.slug}`} className="group block">
      <div className="aspect-[4/3] overflow-hidden border border-stone"><Art kind={cover.kind} url={cover.url} floors={p.floors} seed={i} label={cover.url ? p.title : 'Concept design'} /></div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-2xl group-hover:text-olive">{p.title}</h3>
        <span className="shrink-0 text-xs text-muted">{p.status}</span>
      </div>
      <p className="mt-1 text-sm text-muted">{p.category} · {plotLabel(p)} · {p.style}</p>
      <p className="mt-2 text-sm underline underline-offset-4">View project</p>
    </Link>
  );
}
