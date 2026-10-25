import { Link } from 'react-router-dom';

export default function Breadcrumbs({ trail }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <Link to="/" className="hover:text-charcoal">Home</Link>
      {trail.map(([label, to]) => (
        <span key={label}> / {to ? <Link to={to} className="hover:text-charcoal">{label}</Link> : <span className="text-charcoal">{label}</span>}</span>
      ))}
    </nav>
  );
}
