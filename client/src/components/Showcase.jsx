import { useState } from 'react';
import Art from './Art';

// Plan and elevation always come from the SAME project.
export default function Showcase({ project }) {
  const [tab, setTab] = useState('both');
  const plan = project.gallery.find((g) => g.kind === 'plan');
  const elev = project.gallery.find((g) => g.kind === 'elevation');
  const tabs = [['both', 'Side by side'], ['plan', '2D plan'], ['elevation', '3D elevation']];
  const Panel = ({ g, k }) => (
    <figure><div className="aspect-[4/3] border border-stone"><Art kind={g.kind} url={g.url} floors={project.floors} label={`${project.title}: ${g.caption}`} /></div><figcaption className="mt-2 text-sm text-muted">{g.caption}</figcaption></figure>
  );
  return (
    <div>
      <div role="tablist" className="flex gap-6 border-b border-stone">
        {tabs.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`-mb-px border-b-2 pb-3 text-sm ${tab === k ? 'border-charcoal font-medium' : 'border-transparent text-muted'}`}>{l}</button>
        ))}
      </div>
      <div className={`mt-6 grid gap-6 ${tab === 'both' ? 'md:grid-cols-2' : ''}`}>
        {(tab === 'both' || tab === 'plan') && <Panel g={plan} />}
        {(tab === 'both' || tab === 'elevation') && <Panel g={elev} />}
      </div>
      <p className="mt-4 text-sm text-muted">Both views belong to {project.title}{project.status === 'Concept' ? ', a concept design' : ''}.</p>
    </div>
  );
}
