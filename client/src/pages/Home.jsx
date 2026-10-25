import { useSeo } from '../lib/seo';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import ProjectCard from '../components/ProjectCard';
import Showcase from '../components/Showcase';
import { steps } from '../data/content';
import { useContent } from '../content/ContentContext';
import { whatsappLink } from '../config/site';

const why = [
  ['Plot-aware planning', 'Layouts start from your plot size and road-facing side.'],
  ['Clear visual communication', 'Plans and 3D views you can understand without technical knowledge.'],
  ['Practical space planning', 'Rooms sized and placed for daily use.'],
  ['Collaboration', 'You review and shape the design with us.'],
  ['Defined deliverables', 'What you receive is written in your quotation.'],
  ['Transparent process', 'Four clear steps from first message to final files.'],
];

export default function Home() {
  const { services, projects, posts, testimonials, sample } = useContent();
  useSeo(null, null, { org: true });
  const showcase = projects.find((p) => p.gallery.some((g) => g.kind === 'plan') && p.gallery.some((g) => g.kind === 'elevation'));
  const wa = whatsappLink();
  return (
    <>
      <Hero />
      <section className="container-x py-20">
        <h2 className="font-display text-4xl md:text-5xl">What we design</h2>
        <ul className="mt-10 grid border-t border-stone md:grid-cols-2 md:gap-x-16">
          {services.map((s) => (
            <li key={s.slug} className="border-b border-stone">
              <Link to={`/services/${s.slug}`} className="block py-6 hover:text-olive">
                <h3 className="text-lg font-medium">{s.title}</h3>
                <p className="mt-1 text-sm text-muted">{s.short}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-x py-20">
        <div className="flex items-end justify-between gap-6">
          <h2 className="font-display text-4xl md:text-5xl">Featured concepts</h2>
          <Link to="/projects" className="btn-outline">Explore all projects</Link>
        </div>
        {sample && <p className="mt-3 max-w-xl text-sm text-muted">Sample concept designs. Real portfolio work will replace these.</p>}
        <div className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-3">
          {projects.slice(0, 6).map((p, i) => <div key={p.slug} className={i === 0 ? 'md:col-span-2' : ''}><ProjectCard p={p} i={i} /></div>)}
        </div>
      </section>

      <section className={showcase ? 'bg-white py-20' : 'hidden'}>
        <div className="container-x">
          <h2 className="font-display text-4xl md:text-5xl">From plan to elevation</h2>
          <p className="mt-3 max-w-xl text-muted">A floor plan shows the layout from above. An elevation shows the outside of the same house.</p>
          {showcase && <div className="mt-10"><Showcase project={showcase} /></div>}
        </div>
      </section>

      <section className="container-x py-20">
        <h2 className="font-display text-4xl md:text-5xl">Why work with this studio</h2>
        <dl className="mt-10 grid gap-x-16 gap-y-8 md:grid-cols-2">
          {why.map(([t, d]) => (<div key={t} className="border-t border-stone pt-4"><dt className="font-medium">{t}</dt><dd className="mt-1 text-sm text-muted">{d}</dd></div>))}
        </dl>
      </section>

      <section className="bg-charcoal py-20 text-ivory">
        <div className="container-x">
          <h2 className="font-display text-4xl md:text-5xl">How it works</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-4">
            {steps.map(([t, d], i) => (<li key={t} className="border-t border-ivory/30 pt-4"><p className="text-sm text-stone">Step {i + 1}</p><h3 className="mt-1 font-medium">{t}</h3><p className="mt-2 text-sm text-ivory/70">{d}</p></li>))}
          </ol>
        </div>
      </section>

      {posts.length > 0 && (
        <section className="container-x py-20">
          <div className="flex items-end justify-between gap-6"><h2 className="font-display text-4xl md:text-5xl">Design guides</h2><Link to="/blog" className="btn-outline">All guides</Link></div>
          <ul className="mt-8 grid border-t border-stone md:grid-cols-2 md:gap-x-16">{posts.slice(0, 4).map((p) => (
            <li key={p.slug} className="border-b border-stone"><Link to={`/blog/${p.slug}`} className="block py-5 hover:text-olive"><h3 className="text-lg font-medium">{p.title}</h3><p className="mt-1 text-sm text-muted">{p.excerpt}</p></Link></li>
          ))}</ul>
        </section>
      )}
      {testimonials.length > 0 && (
        <section className="container-x py-20">
          <h2 className="font-display text-4xl md:text-5xl">What clients say</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-2">{testimonials.map((t) => (
            <figure key={t._id} className="border-t border-stone pt-4"><blockquote className="text-muted">{t.text}</blockquote><figcaption className="mt-3 text-sm font-medium">{t.name}{t.role ? <span className="font-normal text-muted">, {t.role}</span> : null}</figcaption></figure>
          ))}</div>
        </section>
      )}
      <section className="container-x py-24 text-center">
        <h2 className="font-display text-4xl md:text-6xl">Planning Your Dream Home?</h2>
        <p className="mx-auto mt-4 max-w-lg text-muted">Tell us about your plot and ideas. Let's discuss a design that works for your space and needs.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/request-quote" className="btn-primary">Request a Quote</Link>
          {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-outline">Chat on WhatsApp</a>}
        </div>
      </section>
    </>
  );
}
