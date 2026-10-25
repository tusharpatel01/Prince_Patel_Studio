import { useSeo } from '../lib/seo';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import Field, { input } from '../components/Field';
import { getJson } from '../lib/api';
import { estimate } from '../lib/estimate';

export default function BudgetEstimator() {
  useSeo('Construction Budget Estimator', 'A rough, educational estimate of house construction cost.');
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);
  const [f, setF] = useState({ city: '', area: '', areaUnit: 'sqft', floors: '', tier: 'standard', customRate: '', selected: [] });
  useEffect(() => { getJson('/estimator').then(setData).catch(() => setErr(true)); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const toggle = (k) => setF({ ...f, selected: f.selected.includes(k) ? f.selected.filter((x) => x !== k) : [...f.selected, k] });

  if (err) return <section className="container-x py-20"><p role="alert">The estimator could not load. Please try again shortly or <Link className="underline" to="/contact">contact us</Link>.</p></section>;
  if (!data) return <section className="container-x py-20 text-muted">Loading estimator...</section>;

  const cfg = data.config;
  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: cfg.currency, maximumFractionDigits: 0 }).format(n);
  const r = estimate({ area: +f.area, areaUnit: f.areaUnit, tier: f.tier, config: cfg, city: f.city, customRate: +f.customRate, selected: f.selected });
  const optionals = cfg.allowances.filter((a) => a.optional && !a.includedInRate);

  return (
    <section className="container-x py-16">
      <Breadcrumbs trail={[['Construction Budget Estimator']]} />
      <h1 className="mt-6 font-display text-5xl md:text-6xl">Construction Budget Estimator</h1>
      <p className="mt-3 max-w-xl text-muted">A rough, educational estimate of construction cost. It is not a quotation, and it does not include architectural design fees.</p>
      {!data.configured && <p className="mt-6 max-w-xl border-l-2 border-stone pl-4 text-sm text-muted">Local construction rates have not been set up yet. You can still enter your own rate per unit area (for example from a contractor's quote).</p>}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="City or location"><input className={input} list="cities" value={f.city} onChange={set('city')} /><datalist id="cities">{cfg.locations.map((l) => <option key={l.name} value={l.name} />)}</datalist></Field>
          <Field label="Finish category"><select className={input} value={f.tier} onChange={set('tier')}><option value="basic">Basic</option><option value="standard">Standard</option><option value="premium">Premium</option></select></Field>
          <Field label="Total built-up area"><input className={input} type="number" min="0" value={f.area} onChange={set('area')} /></Field>
          <Field label="Unit"><select className={input} value={f.areaUnit} onChange={set('areaUnit')}><option value="sqft">Square feet</option><option value="sqm">Square meters</option></select></Field>
          <Field label="Number of floors" hint="For your reference. Enter the total area across all floors."><input className={input} type="number" min="1" value={f.floors} onChange={set('floors')} /></Field>
          <Field label="Your own rate per unit area (optional)" hint="Overrides the configured rate."><input className={input} type="number" min="0" value={f.customRate} onChange={set('customRate')} /></Field>
          {optionals.length > 0 && (
            <fieldset className="sm:col-span-2"><legend className="text-sm font-medium">Optional additions</legend>
              {optionals.map((a) => <label key={a.key} className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={f.selected.includes(a.key)} onChange={() => toggle(a.key)} /> {a.label} ({a.percent}% of base cost)</label>)}
            </fieldset>
          )}
        </div>

        <div className="border border-stone bg-white p-6" aria-live="polite">
          {r ? (
            <>
              <p className="eyebrow">Estimated range</p>
              <p className="mt-2 font-display text-4xl md:text-5xl">{fmt(r.low)} to {fmt(r.high)}</p>
              <p className="mt-2 text-sm text-muted">Central estimate {fmt(r.total)}, using {r.source} ({fmt(r.rate)} per {r.rateUnit === 'sqft' ? 'sq ft' : 'sq m'}). Range is plus or minus {r.spread}%.</p>
              <dl className="mt-5 border-t border-stone text-sm">
                <div className="flex justify-between border-b border-stone py-2"><dt>Base construction cost</dt><dd>{fmt(r.base)}</dd></div>
                {r.items.map((i) => <div key={i.label} className="flex justify-between border-b border-stone py-2"><dt>{i.label} <span className="text-muted">({i.note})</span></dt><dd>{i.amount ? fmt(i.amount) : '-'}</dd></div>)}
              </dl>
            </>
          ) : <p className="text-muted">Enter your area and a location with a configured rate, or your own rate, to see an estimate.</p>}
        </div>
      </div>

      <div className="mt-14 grid gap-8 md:grid-cols-3">
        {[['Assumptions', cfg.assumptions], ['Included', cfg.included], ['Excluded', cfg.excluded]].map(([t, items]) => items.length > 0 && (
          <div key={t} className="border-t border-stone pt-4"><h2 className="font-medium">{t}</h2><ul className="mt-3 space-y-2 text-sm text-muted">{items.map((i) => <li key={i}>{i}</li>)}</ul></div>
        ))}
      </div>
      <p className="mt-10 max-w-2xl text-sm text-muted">Actual cost varies with location, specifications, materials, labour, site conditions and contractor quotations. {data.updatedAt && `Rates last updated ${new Date(data.updatedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}.`}</p>
      <Link to="/request-quote" className="btn-primary mt-6">Request a personalized estimate</Link>
    </section>
  );
}
