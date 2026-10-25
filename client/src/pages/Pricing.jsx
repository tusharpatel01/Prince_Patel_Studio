import { useSeo } from '../lib/seo';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { getJson } from '../lib/api';

const price = (p) => (p.quoteOnly || p.price == null ? 'Request a Quote' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: p.currency, maximumFractionDigits: 0 }).format(p.price));
const Ul = ({ items }) => (items?.length ? <ul className="space-y-1">{items.map((i) => <li key={i}>{i}</li>)}</ul> : <span className="text-muted">-</span>);

export default function Pricing() {
  useSeo('Pricing and Packages', 'Design packages and what each one includes.');
  const [pk, setPk] = useState(null);
  const [err, setErr] = useState(false);
  useEffect(() => { getJson('/packages').then(setPk).catch(() => setErr(true)); }, []);
  const rows = [['Deliverables', (p) => <Ul items={p.deliverables} />], ['Revisions', (p) => p.revisions || '-'], ['Delivery time', (p) => p.deliveryRange || '-'], ['Exclusions', (p) => <Ul items={p.exclusions} />], ['Optional add-ons', (p) => <Ul items={p.addons?.map((a) => (a.price != null ? `${a.name} (${price({ price: a.price, currency: p.currency })})` : a.name))} />]];

  return (
    <section className="container-x py-16">
      <Breadcrumbs trail={[['Pricing']]} />
      <h1 className="mt-6 font-display text-5xl md:text-6xl">Pricing and Packages</h1>
      <p className="mt-3 max-w-xl text-muted">Packages describe what is included. Your written quotation confirms scope, price and terms for your project.</p>
      {err && <p role="alert" className="mt-8">Packages could not load. Please try again shortly.</p>}
      {!err && !pk && <p className="mt-8 text-muted">Loading packages...</p>}
      {pk?.length === 0 && (
        <div className="mt-10 border border-stone bg-white p-6"><h2 className="font-medium">Packages are being prepared</h2><p className="mt-2 text-sm text-muted">Tell us what you need and we'll send a quotation.</p><Link to="/request-quote" className="btn-primary mt-4">Request a Quote</Link></div>
      )}
      {pk?.length > 0 && (
        <>
          <div className="mt-10 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead><tr><th className="w-40 p-3" />{pk.map((p) => <th key={p._id} className="border-b border-charcoal p-3 align-top"><span className="block font-display text-2xl font-normal">{p.name}</span><span className="mt-1 block text-muted">{p.summary}</span><span className="mt-3 block font-medium">{price(p)}</span></th>)}</tr></thead>
              <tbody>{rows.map(([l, fn]) => <tr key={l} className="border-b border-stone align-top"><th scope="row" className="p-3 font-medium">{l}</th>{pk.map((p) => <td key={p._id} className="p-3">{fn(p)}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <div className="mt-10 space-y-8 md:hidden">
            {pk.map((p) => (
              <article key={p._id} className="border border-stone bg-white p-5">
                <h2 className="font-display text-3xl">{p.name}</h2><p className="mt-1 text-sm text-muted">{p.summary}</p><p className="mt-3 font-medium">{price(p)}</p>
                <dl className="mt-4 space-y-3 text-sm">{rows.map(([l, fn]) => <div key={l}><dt className="font-medium">{l}</dt><dd className="mt-1">{fn(p)}</dd></div>)}</dl>
              </article>
            ))}
          </div>
          {pk.some((p) => p.terms) && <div className="mt-8 space-y-2 text-xs text-muted">{pk.filter((p) => p.terms).map((p) => <p key={p._id}><strong>{p.name} terms:</strong> {p.terms}</p>)}</div>}
          <Link to="/request-quote" className="btn-primary mt-10">Request a Quote</Link>
        </>
      )}
    </section>
  );
}
