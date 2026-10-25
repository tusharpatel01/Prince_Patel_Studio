import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLoad, State, day, money } from './ui';
import { api, apiUrl } from '../lib/adminApi';
import { input } from '../components/Field';

const calc = (f) => { const sub = f.lineItems.reduce((s, i) => s + (+i.qty || 0) * (+i.unitPrice || 0), 0); const tax = (sub * (+f.taxPercent || 0)) / 100; return { sub, tax, total: sub + tax }; };

export default function QuoteEditor() {
  const { id } = useParams();
  const { data: q, error, loading, reload } = useLoad(`/admin/quotes/${id}`);
  const [f, setF] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [preview, setPreview] = useState(false);
  const [msg, setMsg] = useState({ text: '', bad: false });
  useEffect(() => { if (q) { setF({ lineItems: q.lineItems.map(({ description, qty, unitPrice }) => ({ description, qty, unitPrice })), taxPercent: q.taxPercent, scope: q.scope || '', exclusions: q.exclusions || '', revisions: q.revisions || '', validUntil: q.validUntil ? q.validUntil.slice(0, 10) : '' }); setDirty(false); } }, [q]);
  if (!q || !f) return <State loading={loading} error={error} />;

  const draft = q.status === 'Draft';
  const set = (k, v) => { setF({ ...f, [k]: v }); setDirty(true); };
  const setLine = (i, k, v) => set('lineItems', f.lineItems.map((l, n) => (n === i ? { ...l, [k]: v } : l)));
  const t = calc(f);
  const act = async (fn, ok) => { setMsg({ text: '', bad: false }); try { await fn(); setMsg({ text: ok, bad: false }); reload(); } catch (e) { setMsg({ text: e.message, bad: true }); reload(); } };
  const save = () => act(() => api(`/admin/quotes/${id}`, { method: 'PUT', body: { ...f, lineItems: f.lineItems.map((l) => ({ description: l.description, qty: +l.qty, unitPrice: +l.unitPrice })), taxPercent: +f.taxPercent || 0, validUntil: f.validUntil || null } }), 'Saved');
  const status = (s) => act(() => api(`/admin/quotes/${id}/status`, { method: 'PATCH', body: { status: s } }), `Marked as ${s}`);
  const send = () => { if (window.confirm(`Email this quotation to ${q.inquiry.email || 'the client'} now?`)) act(() => api(`/admin/quotes/${id}/send`, { method: 'POST' }), 'Email sent and quotation marked as Sent'); };

  return (
    <div className="max-w-3xl">
      <Link to={`/admin/inquiries/${q.inquiry._id}`} className="text-sm underline">Back to inquiry</Link>
      <h1 className="mt-2 font-display text-4xl">{q.number} <span className="text-lg text-muted">{q.status}</span></h1>
      <p className="text-sm text-muted">For {q.inquiry.name} ({q.inquiry.reference}){q.inquiry.email ? `, ${q.inquiry.email}` : ', no email on file'}</p>
      {msg.text && <p role={msg.bad ? 'alert' : 'status'} className={`mt-3 text-sm ${msg.bad ? 'text-red-700' : 'text-olive'}`}>{msg.text}</p>}
      {!draft && <p className="mt-3 border-l-2 border-stone pl-3 text-sm text-muted">This quotation is {q.status.toLowerCase()} and can no longer be edited.</p>}

      <fieldset disabled={!draft} className="mt-8 space-y-6">
        <div><h2 className="font-medium">Line items</h2>
          {f.lineItems.map((l, i) => (
            <div key={i} className="mt-2 grid grid-cols-[1fr_4rem_6rem_auto] gap-2">
              <input className={input} aria-label="Description" value={l.description} onChange={(e) => setLine(i, 'description', e.target.value)} />
              <input className={input} aria-label="Quantity" type="number" min="1" value={l.qty} onChange={(e) => setLine(i, 'qty', e.target.value)} />
              <input className={input} aria-label="Unit price" type="number" min="0" value={l.unitPrice} onChange={(e) => setLine(i, 'unitPrice', e.target.value)} />
              <button type="button" className="px-2 text-sm underline" onClick={() => set('lineItems', f.lineItems.filter((_, n) => n !== i))}>Remove</button>
            </div>
          ))}
          <button type="button" className="mt-3 text-sm underline" onClick={() => set('lineItems', [...f.lineItems, { description: '', qty: 1, unitPrice: 0 }])}>Add line item</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">Tax % (optional)<input className={`${input} mt-1`} type="number" min="0" value={f.taxPercent} onChange={(e) => set('taxPercent', e.target.value)} /></label>
          <label className="text-sm">Valid until<input className={`${input} mt-1`} type="date" value={f.validUntil} onChange={(e) => set('validUntil', e.target.value)} /></label>
        </div>
        {[['scope', 'Scope of work'], ['exclusions', 'Exclusions'], ['revisions', 'Included revisions']].map(([k, l]) => <label key={k} className="block text-sm">{l}<textarea rows={k === 'revisions' ? 2 : 3} className={`${input} mt-1`} value={f[k]} onChange={(e) => set(k, e.target.value)} /></label>)}
      </fieldset>

      <p className="mt-6 text-sm">Subtotal {money(t.sub, q.currency)}{+f.taxPercent ? ` · Tax ${money(t.tax, q.currency)}` : ''} · <strong>Total {money(t.total, q.currency)}</strong></p>

      <div className="mt-6 flex flex-wrap gap-3">
        {draft && <button className="btn-primary" onClick={save}>Save draft</button>}
        <button className="btn-outline" onClick={() => setPreview(!preview)}>{preview ? 'Hide preview' : 'Preview'}</button>
        {dirty ? <span className="self-center text-sm text-muted">Save to enable PDF and sending</span> : <a className="btn-outline" href={apiUrl(`/admin/quotes/${id}/pdf`)}>Download PDF</a>}
        {draft && !dirty && <button className="btn-outline" onClick={send}>Send by email</button>}
      </div>
      {q.emailStatus === 'failed' && <p className="mt-3 text-sm text-red-700">Last email attempt failed. The quotation was not marked as Sent.</p>}

      <div className="mt-6 flex flex-wrap gap-2 text-sm"><span className="self-center text-muted">Set status:</span>
        {['Sent', 'Accepted', 'Rejected'].filter((s) => s !== q.status).map((s) => <button key={s} className="underline" onClick={() => status(s)}>{s}</button>)}
        {q.status !== 'Draft' && <button className="underline" onClick={() => status('Draft')}>Back to Draft</button>}
      </div>

      {preview && (
        <article className="mt-8 border border-stone bg-white p-6 text-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Quotation preview</p>
          <h2 className="mt-1 font-display text-3xl">{q.number}</h2>
          <p className="text-muted">For {q.inquiry.name} · Valid until {day(f.validUntil)}</p>
          <table className="mt-4 w-full"><tbody>{f.lineItems.map((l, i) => <tr key={i} className="border-b border-stone"><td className="py-2">{l.description}</td><td className="py-2 text-right">{l.qty} x {money(+l.unitPrice, q.currency)}</td><td className="py-2 text-right">{money(l.qty * l.unitPrice, q.currency)}</td></tr>)}</tbody></table>
          <p className="mt-3 text-right font-medium">Total {money(t.total, q.currency)}</p>
          {[['Scope of work', f.scope], ['Exclusions', f.exclusions], ['Revisions', f.revisions]].filter(([, v]) => v).map(([l, v]) => <div key={l} className="mt-4"><h3 className="font-medium">{l}</h3><p className="whitespace-pre-wrap text-muted">{v}</p></div>)}
        </article>
      )}
    </div>
  );
}
