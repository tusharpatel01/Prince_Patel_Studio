// Central contact config. Values come from .env (see .env.example);
// Admin > Settings overrides these once saved.
const env = import.meta.env;

export const site = {
  name: 'Prince Patel',
  tagline: 'Architecture & Building Design',
  title: 'Civil Engineer & Architectural Design Consultant',
  whatsapp: (env.WHATSAPP_NUMBER || '').replace(/\D/g, ''),
  email: env.PUBLIC_CONTACT_EMAIL || '',
  phone: env.PUBLIC_PHONE || '',
  url: env.SITE_URL || '',
  apiUrl: env.API_URL || 'http://localhost:5000/api',
  seoTitle: '',
  seoDescription: '',
  social: {},
};

export const whatsappLink = (message = 'Hello Prince, I would like to discuss a design project.') =>
  site.whatsapp ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}` : null;

export const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/projects', label: 'Projects' },
  {
    label: 'Design Tools',
    children: [
      { to: '/plot-finder', label: 'Plot-Based Design Finder' },
      { to: '/requirement-builder', label: 'House Requirement Builder' },
      { to: '/budget-estimator', label: 'Construction Budget Estimator' },
    ],
  },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];
