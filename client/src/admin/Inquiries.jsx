import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLoad, State, day } from './ui';
import { apiUrl } from '../lib/adminApi';
import { input } from '../components/Field';

const STATUSES = ['New', 'Contacted', 'Consultation Scheduled', 'Quote Sent', 'Approved', 'In Progress', 'Completed', 'Closed'];

export default function Inquiries() {
  const [q, setQ] = useState(''); const [status, setStatus] = useState(''); const [archived, setArchived] = useState(false); const [page, setPage] = useState(1);
  const params = new URLSearchParams({ ...(q && { q }), ...(status && { status }), ...(archived && { archived: 'true' }) });
  const { data, error, loading } = useLoad(`/admin/inquiries?${params}&page=${page}`);
  const reset = (fn) => (e) => { fn(e.target.type === 'checkbox' ? e.target.checked : e.target.value); setPage(1); };
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3"><h1 className="font-display text-4xl">Inquiries</h1><a className="btn-outline" href={apiUrl(`/admin/inquiries/export.csv?${params}`)}>Export CSV</a></div>
      <div className="mt-6 flex flex-wrap items-end gap-4">
        <label className="text-sm">Search<input className={`${input} mt-1`} placeholder="Name, phone, reference, city" value={q} onChange={reset(setQ)} /></label>
        <label className="text-sm">Status<select className={`${input} mt-1`} value={status} onChange={reset(setStatus)}><option value="">All</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="flex items-center gap-2 pb-3 text-sm"><input type="checkbox" checked={archived} onChange={reset(setArchived)} /> Archived</label>
      </div>
      <div className="mt-6">
        <State loading={loading && !data} error={error} />
        {data && (data.items.length === 0 ? <p className="text-muted">No inquiries match.</p> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm">
            <thead><tr className="border-b border-charcoal">{['Reference', 'Name', 'Location', 'Status', 'Received'].map((h) => <th key={h} className="p-2 font-medium">{h}</th>)}</tr></thead>
            <tbody>{data.items.map((i) => <tr key={i._id} className="border-b border-stone"><td className="p-2"><Link className="underline" to={`/admin/inquiries/${i._id}`}>{i.reference}</Link></td><td className="p-2">{i.name}</td><td className="p-2">{i.location || '-'}</td><td className="p-2">{i.status}</td><td className="p-2">{day(i.createdAt)}</td></tr>)}</tbody>
          </table></div>
        ))}
        {data?.pages > 1 && <div className="mt-4 flex items-center gap-3 text-sm"><button className="btn-outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>Page {data.page} of {data.pages}<button className="btn-outline" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button></div>}
      </div>
    </div>
  );
}
