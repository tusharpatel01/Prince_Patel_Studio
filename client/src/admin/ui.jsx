import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/adminApi';

export function useLoad(path) {
  const [s, setS] = useState({ data: null, error: '', loading: true });
  const load = useCallback(() => api(path).then((data) => setS({ data, error: '', loading: false })).catch((e) => setS({ data: null, error: e.message, loading: false })), [path]);
  useEffect(() => { setS((x) => ({ ...x, loading: true })); load(); }, [load]);
  return { ...s, reload: load };
}

export const money = (n, c = 'INR') => new Intl.NumberFormat('en-IN', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(n || 0);
export const day = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-');

export const Stat = ({ label, value }) => (<div className="border border-stone bg-white p-4"><p className="text-xs text-muted">{label}</p><p className="mt-1 font-display text-4xl">{value}</p></div>);

export function Bars({ items, empty = 'No data yet' }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (!items.some((i) => i.value)) return <p className="text-sm text-muted">{empty}</p>;
  return (
    <ul className="space-y-2 text-sm">
      {items.map((i) => (
        <li key={i.label} className="grid grid-cols-[9rem_1fr_2rem] items-center gap-3"><span className="truncate">{i.label}</span><span className="h-2 bg-ivory"><span className="block h-2 bg-charcoal" style={{ width: `${(i.value / max) * 100}%` }} /></span><span className="text-right text-muted">{i.value}</span></li>
      ))}
    </ul>
  );
}

export const State = ({ loading, error }) => (loading ? <p className="text-muted">Loading...</p> : error ? <p role="alert" className="text-red-700">{error}</p> : null);
