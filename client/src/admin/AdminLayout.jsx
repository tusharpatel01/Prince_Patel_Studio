import { NavLink, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const groups = [
  ['Business', [['/admin', 'Dashboard', true], ['/admin/inquiries', 'Inquiries'], ['/admin/quotes', 'Quotes'], ['/admin/analytics', 'Analytics']]],
  ['Content', [['/admin/projects', 'Projects'], ['/admin/media', 'Media'], ['/admin/services', 'Services'], ['/admin/posts', 'Blog'], ['/admin/faqs', 'FAQs'], ['/admin/testimonials', 'Testimonials']]],
  ['Site', [['/admin/packages', 'Pricing packages'], ['/admin/estimator', 'Estimator'], ['/admin/settings', 'Settings']]],
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  if (user === undefined) return <p className="p-10 text-muted">Checking sign-in...</p>;
  if (!user) return <Navigate to="/admin/login" replace />;
  const cls = ({ isActive }) => `block px-3 py-2 text-sm ${isActive ? 'bg-charcoal text-ivory' : 'hover:bg-white'}`;
  return (
    <div className="min-h-screen md:grid md:grid-cols-[13rem_1fr]">
      <aside className="border-b border-stone p-4 md:border-b-0 md:border-r">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em]">Studio admin</p>
        <nav aria-label="Admin">
          {groups.map(([g, links]) => (
            <div key={g} className="mb-3">
              <p className="px-3 text-xs text-muted">{g}</p>
              <div className="flex flex-wrap gap-1 md:block">{links.map(([to, l, end]) => <NavLink key={to} to={to} end={end} className={cls}>{l}</NavLink>)}</div>
            </div>
          ))}
        </nav>
        <p className="mt-4 truncate px-3 text-xs text-muted">{user.email}</p>
        <button onClick={logout} className="mt-2 px-3 text-sm underline">Sign out</button>
      </aside>
      <main className="min-w-0 p-5 md:p-8"><Outlet /></main>
    </div>
  );
}
