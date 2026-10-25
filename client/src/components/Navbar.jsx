import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import Wordmark from './Wordmark';
import { navLinks } from '../config/site';

const linkCls = ({ isActive }) =>
  `text-sm transition-colors hover:text-olive ${isActive ? 'text-charcoal font-medium' : 'text-muted'}`;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => { setOpen(false); setToolsOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-stone/60 bg-ivory/95 backdrop-blur-sm">
      <div className="container-x flex h-[72px] items-center justify-between">
        <Wordmark />

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {navLinks.map((l) =>
            l.children ? (
              <div key={l.label} className="relative" onMouseLeave={() => setToolsOpen(false)}>
                <button
                  className="flex items-center gap-1 text-sm text-muted hover:text-olive"
                  aria-expanded={toolsOpen}
                  onClick={() => setToolsOpen((v) => !v)}
                  onMouseEnter={() => setToolsOpen(true)}
                >
                  {l.label} <ChevronDown size={14} />
                </button>
                {toolsOpen && (
                  <div className="absolute left-0 top-full w-64 border border-stone/60 bg-white py-2">
                    {l.children.map((c) => (
                      <Link key={c.to} to={c.to} className="block px-4 py-2.5 text-sm text-charcoal hover:bg-ivory">{c.label}</Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkCls}>{l.label}</NavLink>
            )
          )}
          <Link to="/request-quote" className="btn-primary">Request a Quote</Link>
        </nav>

        <button className="lg:hidden" onClick={() => setOpen((v) => !v)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-x-0 top-[72px] bottom-0 overflow-y-auto bg-ivory lg:hidden">
          <nav className="container-x flex flex-col py-6" aria-label="Mobile">
            {navLinks.flatMap((l) => (l.children ? l.children : [l])).map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} className="border-b border-stone/60 py-4 font-display text-2xl">{l.label}</NavLink>
            ))}
            <Link to="/request-quote" className="btn-primary mt-8">Request a Quote</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
