import { Link } from 'react-router-dom';
import { site } from '../config/site';

export default function Wordmark({ light = false }) {
  return (
    <Link to="/" className={`block leading-none ${light ? 'text-ivory' : 'text-charcoal'}`} aria-label={`${site.name}, ${site.tagline}`}>
      <span className="block text-lg font-semibold tracking-[0.22em] uppercase">{site.name}</span>
      <span className="mt-1 block text-[0.6rem] tracking-[0.2em] uppercase opacity-70">{site.tagline}</span>
    </Link>
  );
}
