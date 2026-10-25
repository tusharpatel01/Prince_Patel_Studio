import { useSeo } from '../lib/seo';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { steps } from '../data/content';
import { useContent } from '../content/ContentContext';
import { site } from '../config/site';

const Wrap = ({ title, children }) => { useSeo(title); return (
  <section className="container-x py-16">
    <Breadcrumbs trail={[[title]]} />
    <h1 className="mt-6 font-display text-5xl md:text-6xl">{title}</h1>
    <div className="mt-8 max-w-2xl">{children}</div>
  </section>
); };

export const About = () => {
  const { settings } = useContent();
  return (
    <Wrap title="About Prince">
      {settings.aboutText ? (
        <div className="space-y-4 text-lg leading-relaxed text-muted">{settings.aboutText.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}</div>
      ) : (
        <>
          <p className="text-lg leading-relaxed text-muted">{site.name} is a {site.title.toLowerCase()} designing 2D floor plans and 3D elevations for homes and buildings. Work starts from your plot, your family and the way you want to live.</p>
          <p className="mt-4 text-muted">More about Prince will appear here once it is added.</p>
        </>
      )}
      <Link to="/contact" className="btn-primary mt-8">Get in touch</Link>
    </Wrap>
  );
};

export const Process = () => (
  <Wrap title="Design Process">
    <ol className="border-t border-stone">
      {steps.map(([t, d], i) => (<li key={t} className="border-b border-stone py-6"><p className="text-sm text-muted">Step {i + 1}</p><h2 className="font-display text-3xl">{t}</h2><p className="mt-1 text-muted">{d}</p></li>))}
    </ol>
    <Link to="/request-quote" className="btn-primary mt-8">Request a Quote</Link>
  </Wrap>
);

export const FAQ = () => { const { faqs } = useContent(); return (
  <Wrap title="Frequently Asked Questions">
    {faqs.map(([q, a]) => (<details key={q} className="border-t border-stone py-4"><summary className="cursor-pointer font-medium">{q}</summary><p className="mt-2 text-muted">{a}</p></details>))}
    <Link to="/contact" className="btn-outline mt-8">Ask a question</Link>
  </Wrap>
); };

const Draft = () => <p className="mb-6 border-l-2 border-stone pl-4 text-sm text-muted">Draft text. Have it reviewed and edited before publishing.</p>;

export const Privacy = () => (
  <Wrap title="Privacy Policy"><Draft />
    <p className="text-muted">When you send an inquiry we collect the details you provide, such as your name, phone, email, plot details and requirements. We use them only to respond to your inquiry and prepare quotations. We do not sell your information. Contact us to ask for your details to be corrected or deleted.</p>
  </Wrap>
);

export const Terms = () => (
  <Wrap title="Terms and Conditions"><Draft />
    <p className="text-muted">Designs shown on this site are concept examples. Services cover conceptual architectural design as described in each quotation. Structural engineering, construction supervision and statutory approvals are not included unless agreed in writing. Construction estimates are educational and are not quotations.</p>
  </Wrap>
);
