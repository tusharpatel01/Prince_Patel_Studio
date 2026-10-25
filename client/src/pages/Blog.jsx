import { useSeo } from '../lib/seo';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { useContent } from '../content/ContentContext';

export default function Blog() {
  const { posts } = useContent();
  useSeo('Design Guides', 'Guides to help you plan and prepare for building a home.');
  return (
    <section className="container-x py-16">
      <Breadcrumbs trail={[['Design Guides']]} />
      <h1 className="mt-6 font-display text-5xl md:text-6xl">Design Guides</h1>
      {posts.length === 0 ? <p className="mt-8 text-muted">Guides are coming soon.</p> : (
        <ul className="mt-10 border-t border-stone">{posts.map((p) => (
          <li key={p.slug} className="border-b border-stone"><Link to={`/blog/${p.slug}`} className="block py-6 hover:text-olive"><h2 className="font-display text-3xl">{p.title}</h2><p className="mt-1 text-muted">{p.excerpt}</p></Link></li>
        ))}</ul>
      )}
    </section>
  );
}
