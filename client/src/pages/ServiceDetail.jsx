import { useSeo } from '../lib/seo';
import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import Art from '../components/Art';
import ProjectCard from '../components/ProjectCard';
import NotFound from './NotFound';
import { useContent } from '../content/ContentContext';

const List = ({ title, items }) => (
  <div className="border-t border-stone pt-4"><h2 className="font-medium">{title}</h2><ul className="mt-3 space-y-2 text-sm text-muted">{items.map((i) => <li key={i}>{i}</li>)}</ul></div>
);

export default function ServiceDetail() {
  const { services, projects } = useContent();
  const { slug } = useParams();
  const s = services.find((x) => x.slug === slug);
  useSeo(s?.title, s?.short);
  if (!s) return <NotFound />;
  const related = projects.filter((p) => (s.art === 'interior' ? p.category === 'Interior' : p.gallery.some((g) => g.kind === s.art))).slice(0, 3);
  return (
    <article className="container-x py-16">
      <Breadcrumbs trail={[['Services', '/services'], [s.title]]} />
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-5xl md:text-6xl">{s.title}</h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">{s.desc}</p>
          <Link to={`/request-quote?service=${s.slug}`} className="btn-primary mt-8">Request a Quote</Link>
        </div>
        <div className="aspect-[4/3] border border-stone"><Art kind={s.art} label="Illustration" /></div>
      </div>
      <div className="mt-14 grid gap-8 md:grid-cols-3">
        <List title="Who it suits" items={s.suitable} />
        <List title="Possible deliverables" items={s.deliverables} />
        <List title="What to prepare" items={s.prepare} />
      </div>
      <p className="mt-10 border-l-2 border-stone pl-4 text-sm text-muted">This is conceptual design. Structural engineering, construction supervision and statutory approvals are not included unless agreed in writing.</p>
      <div className="mt-14">
        <h2 className="font-display text-3xl">Questions</h2>
        {s.faqs.map(([q, a]) => (<div key={q} className="mt-4 border-t border-stone pt-4"><h3 className="font-medium">{q}</h3><p className="mt-1 text-sm text-muted">{a}</p></div>))}
      </div>
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-3xl">Related concepts</h2>
          <div className="mt-6 grid gap-8 md:grid-cols-3">{related.map((p, i) => <ProjectCard key={p.slug} p={p} i={i} />)}</div>
        </div>
      )}
    </article>
  );
}
