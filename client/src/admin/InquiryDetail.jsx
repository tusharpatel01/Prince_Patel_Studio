import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLoad, State, day, money } from './ui';
import { api } from '../lib/adminApi';
import { input } from '../components/Field';
import { svcName } from './Dashboard';

const STATUSES = ['New', 'Contacted', 'Consultation Scheduled', 'Quote Sent', 'Approved', 'In Progress', 'Completed', 'Closed'];

export default function InquiryDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data: x, error, loading, reload } = useLoad(`/admin/inquiries/${id}`);
  const quotes = useLoad(`/admin/quotes?inquiry=${id}`);
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');
  if (!x) return <State loading={loading} error={error} />;

  const run = async (fn) => { setMsg(''); try { await fn(); reload(); } catch (e) { setMsg(e.message); } };
  const patch = (b) => run(() => api(`/admin/inquiries/${id}`, { method: 'PATCH', body: b }));
  const rows = [['Phone', x.phone], ['Email', x.email], ['Location', x.location], ['Property', x.propertyType], ['Plot', x.plotWidth && `${x.plotWidth} x ${x.plotLength} ${x.unit}`], ['Floors', x.floors], ['Style', x.style], ['Services', x.services.map(svcName).join(', ')], ['Budget', x.budget], ['Timeline', x.timeline], ['Preferred contact', x.preferredContact], ['Received', day(x.createdAt)]];

  return (
    <div className="max-w-3xl">
      <Link to="/admin/inquiries" className="text-sm underline">All inquiries</Link>
      <h1 className="mt-2 font-display text-4xl">{x.name} <span className="text-lg text-muted">{x.reference}</span></h1>
      {msg && <p role="alert" className="mt-3 text-sm text-red-700">{msg}</p>}
      <div className="mt-6 flex flex-wrap items-end gap-4">
        <label className="text-sm">Status<select className={`${input} mt-1`} value={x.status} onChange={(e) => patch({ status: e.target.value })}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="text-sm">Follow-up date<input type="date" className={`${input} mt-1`} value={x.followUpDate ? x.followUpDate.slice(0, 10) : ''} onChange={(e) => patch({ followUpDate: e.target.value || null })} /></label>
        <button className="btn-outline" onClick={() => patch({ archived: !x.archived })}>{x.archived ? 'Unarchive' : 'Archive'}</button>
      </div>
      <dl className="mt-8 border-t border-stone">{rows.filter(([, v]) => v).map(([k, v]) => <div key={k} className="grid grid-cols-[9rem_1fr] border-b border-stone py-2 text-sm"><dt className="text-muted">{k}</dt><dd>{v}</dd></div>)}</dl>
      {x.brief && <><h2 className="mt-8 font-medium">Project brief</h2><pre className="mt-2 whitespace-pre-wrap border border-stone bg-white p-4 font-sans text-sm">{x.brief}</pre></>}
      {x.files.length > 0 && <><h2 className="mt-8 font-medium">Files</h2><ul className="mt-2 text-sm">{x.files.map((f) => <li key={f.url}><a className="underline" href={f.url} target="_blank" rel="noopener noreferrer">{f.name || 'File'}</a></li>)}</ul></>}

      <h2 className="mt-10 font-medium">Quotations</h2>
      <ul className="mt-2 text-sm">{quotes.data?.map((q) => <li key={q._id} className="border-b border-stone py-2"><Link className="underline" to={`/admin/quotes/${q._id}`}>{q.number}</Link> · {q.status} · {money(q.totals.total, q.currency)}</li>)}</ul>
      <button className="btn-primary mt-4" onClick={() => run(async () => { const q = await api('/admin/quotes', { method: 'POST', body: { inquiryId: id } }); nav(`/admin/quotes/${q._id}`); })}>Create quotation</button>

      <h2 className="mt-10 font-medium">Private notes</h2>
      <ul className="mt-2 space-y-2 text-sm">{x.notes.map((n) => <li key={n._id} className="border-l-2 border-stone pl-3"><span className="text-xs text-muted">{day(n.at)}</span><br />{n.text}</li>)}</ul>
      <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (note.trim()) run(async () => { await api(`/admin/inquiries/${id}/notes`, { method: 'POST', body: { text: note } }); setNote(''); }); }}>
        <input className={input} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note only you can see" /><button className="btn-primary">Add</button>
      </form>
    </div>
  );
}
