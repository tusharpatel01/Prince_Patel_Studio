import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoad, State } from './ui';
import { api } from '../lib/adminApi';
import Field, { input } from '../components/Field';
import ImagesField from './ImagesField';

const DEFAULT = { lines: [], images: [], addons: [], faqs: [], checkbox: false };
const blank = (cfg) => Object.fromEntries(cfg.fields.flatMap((f) => [[f.k, f.def ?? DEFAULT[f.type] ?? (f.type === 'select' ? f.options[0] : '')], ...(f.type === 'images' ? [['coverIndex', 0]] : [])]));

const toValues = (cfg, it) => Object.fromEntries(cfg.fields.flatMap((f) => {
  const v = it[f.k];
  const out = f.type === 'lines' ? (v || []).join('\n') : f.type === 'addons' ? (v || []).map((a) => (a.price != null ? `${a.name} | ${a.price}` : a.name)).join('\n')
    : f.type === 'number' ? (v ?? '') : f.type === 'checkbox' ? !!v : f.type === 'faqs' || f.type === 'images' ? v || [] : v ?? '';
  return [[f.k, out], ...(f.type === 'images' ? [['coverIndex', it.coverIndex || 0]] : [])];
}));

const toPayload = (cfg, v) => {
  const o = {};
  for (const f of cfg.fields) {
    const x = v[f.k];
    if (f.k === 'slug' && !x) continue;
    if (f.type === 'lines') o[f.k] = x.split('\n').map((s) => s.trim()).filter(Boolean);
    else if (f.type === 'addons') o[f.k] = x.split('\n').map((l) => l.split('|')).filter(([n]) => n.trim()).map(([n, p]) => ({ name: n.trim(), price: p && p.trim() !== '' ? Number(p) : null }));
    else if (f.k === 'order') o[f.k] = Number(x) || 0;
    else if (f.type === 'number') o[f.k] = x === '' || x == null ? null : Number(x);
    else if (f.type === 'faqs') o[f.k] = x.filter((p) => p.q && p.a);
    else if (f.type === 'images') { o[f.k] = x.map(({ url, caption, kind }) => ({ url, caption, kind })); o.coverIndex = v.coverIndex || 0; }
    else o[f.k] = x;
  }
  return o;
};

export default function Resource({ cfg }) {
  const nav = useNavigate();
  const { data, error, loading, reload } = useLoad(`/admin/${cfg.path}`);
  const [edit, setEdit] = useState(null); // null = list, { id?, v } = form
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const fail = (e) => setMsg([e.message, ...Object.values(e.fields || {})].join(' · '));

  const save = async (e) => {
    e.preventDefault(); setMsg(''); setBusy(true);
    try {
      const body = toPayload(cfg, edit.v);
      await api(`/admin/${cfg.path}${edit.id ? `/${edit.id}` : ''}`, { method: edit.id ? 'PUT' : 'POST', body });
      setEdit(null); reload();
    } catch (x) { fail(x); } finally { setBusy(false); }
  };
  const toggle = async (it) => { setMsg(''); try { await api(`/admin/${cfg.path}/${it._id}`, { method: 'PUT', body: toPayload(cfg, { ...toValues(cfg, it), published: !it.published }) }); reload(); } catch (x) { fail(x); } };
  const del = async (it) => { if (!window.confirm('Delete this permanently?')) return; try { await api(`/admin/${cfg.path}/${it._id}`, { method: 'DELETE' }); reload(); } catch (x) { fail(x); } };

  if (edit) {
    const v = edit.v;
    const set = (patch) => setEdit({ ...edit, v: { ...v, ...patch } });
    return (
      <form onSubmit={save} className="max-w-2xl space-y-5">
        <h1 className="font-display text-4xl">{edit.id ? 'Edit' : 'New'} {cfg.single}</h1>
        {cfg.fields.map((f) => {
          const k = f.k;
          if (f.type === 'checkbox') return <label key={k} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={v[k]} onChange={(e) => set({ [k]: e.target.checked })} /> {f.label}</label>;
          if (f.type === 'images') return <div key={k}><p className="mb-1 text-sm font-medium">{f.label}</p><ImagesField images={v.images} cover={v.coverIndex} onChange={set} /></div>;
          if (f.type === 'faqs') return (
            <div key={k}><p className="mb-1 text-sm font-medium">{f.label}</p>
              {v[k].map((p, i) => <div key={i} className="mb-2 space-y-1 border border-stone bg-white p-2"><input className={input} placeholder="Question" value={p.q} onChange={(e) => set({ [k]: v[k].map((x, n) => (n === i ? { ...x, q: e.target.value } : x)) })} /><textarea rows={2} className={input} placeholder="Answer" value={p.a} onChange={(e) => set({ [k]: v[k].map((x, n) => (n === i ? { ...x, a: e.target.value } : x)) })} /><button type="button" className="text-xs underline" onClick={() => set({ [k]: v[k].filter((_, n) => n !== i) })}>Remove</button></div>)}
              <button type="button" className="text-sm underline" onClick={() => set({ [k]: [...v[k], { q: '', a: '' }] })}>Add question</button></div>);
          const common = { className: input, value: v[k], onChange: (e) => set({ [k]: e.target.value }) };
          return (
            <Field key={k} label={f.label} hint={f.hint}>
              {f.type === 'select' ? <select {...common}>{f.options.map((o) => <option key={o} value={o}>{o || 'None'}</option>)}</select>
                : f.type === 'textarea' || f.type === 'lines' || f.type === 'addons' ? <textarea rows={f.type === 'textarea' ? 5 : 4} {...common} />
                : <input type={f.type === 'number' ? 'number' : 'text'} step="any" {...common} />}
            </Field>
          );
        })}
        {msg && <p role="alert" className="text-sm text-red-700">{msg}</p>}
        <div className="flex gap-3"><button disabled={busy} className="btn-primary disabled:opacity-60">{busy ? 'Saving...' : 'Save'}</button><button type="button" className="btn-outline" onClick={() => { setEdit(null); setMsg(''); }}>Cancel</button></div>
      </form>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="font-display text-4xl">{cfg.title}</h1><button className="btn-primary" onClick={() => { setMsg(''); setEdit({ v: blank(cfg) }); }}>New {cfg.single}</button></div>
      {cfg.note && <p className="mt-2 max-w-xl text-sm text-muted">{cfg.note}</p>}
      {msg && <p role="alert" className="mt-3 text-sm text-red-700">{msg}</p>}
      <div className="mt-6"><State loading={loading} error={error} />
        {data && (data.length === 0 ? <p className="text-muted">Nothing here yet.</p> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm">
            <thead><tr className="border-b border-charcoal">{cfg.cols.map(([, l]) => <th key={l} className="p-2 font-medium">{l}</th>)}<th className="p-2 font-medium">Status</th><th /></tr></thead>
            <tbody>{data.map((it) => (
              <tr key={it._id} className="border-b border-stone">
                {cfg.cols.map(([k]) => <td key={k} className="p-2">{String(it[k] ?? '-')}</td>)}
                <td className="p-2">{it.published ? 'Published' : 'Draft'}</td>
                <td className="space-x-3 whitespace-nowrap p-2 text-right">
                  <button className="underline" onClick={() => { setMsg(''); setEdit({ id: it._id, v: toValues(cfg, it) }); }}>Edit</button>
                  {cfg.preview && <button className="underline" onClick={() => nav(`/admin/${cfg.path}/${it._id}/preview`)}>Preview</button>}
                  <button className="underline" onClick={() => toggle(it)}>{it.published ? 'Unpublish' : 'Publish'}</button>
                  <button className="underline" onClick={() => del(it)}>Delete</button>
                </td>
              </tr>))}</tbody>
          </table></div>
        ))}
      </div>
    </div>
  );
}
