import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { site, whatsappLink } from '../config/site';

// Original line drawing of a simple plan: a placeholder until real project imagery is uploaded.
function PlanDrawing() {
  const draw = { hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 2.2, ease: 'easeInOut' } } };
  return (
    <motion.svg viewBox="0 0 400 480" className="h-full w-full" fill="none" stroke="#252623" strokeWidth="1.2" initial="hidden" animate="show" role="img" aria-label="Line drawing of a house floor plan">
      <motion.rect variants={draw} x="30" y="30" width="340" height="420" strokeWidth="3" />
      <motion.path variants={draw} d="M30 220 H200 M200 30 V220 M200 150 H370 M260 150 V450 M30 330 H260 M130 330 V450" />
      <motion.path variants={draw} d="M150 220 a30 30 0 0 1 -30 0 M200 120 a24 24 0 0 0 0 -24 M260 300 a26 26 0 0 1 -26 0" stroke="#777B62" />
      <motion.path variants={draw} d="M30 90 H4 M30 450 H4 M4 90 V450 M30 478 H370 M30 470 V486 M370 470 V486" stroke="#77766F" strokeWidth="0.8" />
      <g stroke="none" fill="#77766F" fontSize="11" fontFamily="DM Sans">
        <text x="95" y="130" textAnchor="middle">Living</text>
        <text x="285" y="95" textAnchor="middle">Kitchen</text>
        <text x="315" y="310" textAnchor="middle">Bedroom</text>
        <text x="80" y="395" textAnchor="middle">Bed 2</text>
        <text x="195" y="395" textAnchor="middle">Bath</text>
        <text x="200" y="498" textAnchor="middle">Illustrative layout</text>
      </g>
    </motion.svg>
  );
}

export default function Hero() {
  const wa = whatsappLink('Hello Prince, I would like to discuss my house design.');
  return (
    <section className="container-x grid min-h-[calc(100svh-72px)] items-center gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-0">
      <div>
        <p className="eyebrow">Civil Engineering · Architectural Design</p>
        <h1 className="mt-6 font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.98]">
          Thoughtful Spaces. Beautifully Designed.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          Explore thoughtful 2D floor plans and 3D architectural designs for homes and buildings, tailored to your plot, preferences, and way of living.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link to="/projects" className="btn-primary">Explore Our Designs</Link>
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-outline">Discuss Your Project</a>
          ) : (
            <Link to="/contact" className="btn-outline">Discuss Your Project</Link>
          )}
        </div>
        <p className="mt-12 border-t border-stone pt-5 text-sm text-muted">
          <span className="font-medium text-charcoal">{site.name}</span>, {site.title}
        </p>
      </div>
      <div className="mx-auto aspect-[5/6] w-full max-w-md border border-stone bg-white p-6 lg:max-w-none">
        <PlanDrawing />
      </div>
    </section>
  );
}
