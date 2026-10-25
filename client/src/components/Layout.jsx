import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useContent } from '../content/ContentContext';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';

export default function Layout() {
  useContent(); // re-render the shell when site settings (phone, WhatsApp) load
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      <Navbar />
      <main id="main"><Outlet /></main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
