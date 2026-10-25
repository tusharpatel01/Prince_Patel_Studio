import { Link } from 'react-router-dom';
import { useLoad, State, day, money } from './ui';

export default function Quotes() {
  const { data, error, loading } = useLoad('/admin/quotes');
  return (
    <div>
      <h1 className="font-display text-4xl">Quotations</h1>
      <p className="mt-2 text-sm text-muted">Create a quotation from an inquiry's page.</p>
      <div className="mt-6"><State loading={loading} error={error} />
        {data && (data.length === 0 ? <p className="text-muted">No quotations yet.</p> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm">
            <thead><tr className="border-b border-charcoal">{['Number', 'Client', 'Status', 'Total', 'Valid until'].map((h) => <th key={h} className="p-2 font-medium">{h}</th>)}</tr></thead>
            <tbody>{data.map((q) => <tr key={q._id} className="border-b border-stone"><td className="p-2"><Link className="underline" to={`/admin/quotes/${q._id}`}>{q.number}</Link></td><td className="p-2">{q.inquiry?.name}</td><td className="p-2">{q.status}</td><td className="p-2">{money(q.totals.total, q.currency)}</td><td className="p-2">{day(q.validUntil)}</td></tr>)}</tbody>
          </table></div>
        ))}
      </div>
    </div>
  );
}
