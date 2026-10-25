import { useSeo } from '../lib/seo';
import { Link } from 'react-router-dom';

export default function NotFound() {
  useSeo('Page not found', null, { noindex: true });
  return (
    <section className="container-x py-28">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 font-display text-5xl md:text-7xl">This page isn't on the plan.</h1>
      <p className="mt-6 max-w-prose text-muted">The link may be old or mistyped. Head back home, or tell us what you were looking for.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/" className="btn-primary">Go to home</Link>
        <Link to="/contact" className="btn-outline">Contact Prince</Link>
      </div>
    </section>
  );
}
