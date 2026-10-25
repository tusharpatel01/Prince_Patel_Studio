import { useSeo } from '../lib/seo';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { useContent } from '../content/ContentContext';

export default function Services() {
  const { services } = useContent();
  useSeo('Services', 'Conceptual 2D floor plans, 3D elevations and interior visualization for homes and buildings.');
  return (
    <section className="container-x py-16">
      <Breadcrumbs trail={[['Services']]} />
      <h1 className="mt-6 font-display text-5xl md:text-6xl">Services</h1>
      <p className="mt-4 max-w-xl text-muted">Conceptual architectural design for homes and buildings. Structural engineering, construction supervision and statutory approvals are separate.</p>
      <ul className="mt-12 border-t border-stone">
        {services.map((s) => (
          <li key={s.slug} className="grid gap-4 border-b border-stone py-8 md:grid-cols-[1fr_2fr_auto] md:items-center">
            <h2 className="font-display text-3xl">{s.title}</h2>
            <p className="text-muted">{s.short}</p>
            <div className="flex gap-4 text-sm">
              <Link to={`/services/${s.slug}`} className="underline underline-offset-4">Details</Link>
              <Link to={`/request-quote?service=${s.slug}`} className="underline underline-offset-4">Request a quote</Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
