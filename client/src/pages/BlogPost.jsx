import { useSeo } from '../lib/seo';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import NotFound from './NotFound';
import { getJson } from '../lib/api';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(undefined);
  useEffect(() => { setPost(undefined); getJson(`/posts/${slug}`).then(setPost).catch(() => setPost(null)); }, [slug]);
  useSeo(post?.title, post?.excerpt);
  if (post === undefined) return <p className="container-x py-20 text-muted">Loading...</p>;
  if (!post) return <NotFound />;
  return (
    <article className="container-x py-16">
      <Breadcrumbs trail={[['Design Guides', '/blog'], [post.title]]} />
      <h1 className="mt-6 max-w-3xl font-display text-5xl md:text-6xl">{post.title}</h1>
      <div className="mt-8 max-w-2xl space-y-4 leading-relaxed">
        {(post.body || '').split(/\n{2,}/).map((b, i) => (b.startsWith('## ') ? <h2 key={i} className="pt-4 font-display text-3xl">{b.slice(3)}</h2> : <p key={i} className="text-muted">{b}</p>))}
      </div>
    </article>
  );
}
