import { useEffect, useState } from 'react';
import { useLoad, State } from './ui';
import { api } from '../lib/adminApi';
import Field, { input } from '../components/Field';

const top = [['brandName', 'Brand name'], ['phone', 'Phone'], ['email', 'Public email'], ['whatsapp', 'WhatsApp number', 'Digits only with country code, e.g. 919876543210'], ['siteUrl', 'Site URL'], ['currency', 'Currency code', 'e.g. INR'], ['seoTitle', 'Default page title'], ['seoDescription', 'Default meta description']];
const social = ['instagram', 'facebook', 'linkedin', 'youtube'];

export default function Settings() {
  const { data, error, loading } = useLoad('/settings');
  const [f, setF] = useState(null);
  const [msg, setMsg] = useState({ t: '', bad: false });
  useEffect(() => { if (data) setF({ ...data, social: { ...(data.social || {}) } }); }, [data]);
  if (!f) return <State loading={loading} error={error} />;
  const save = async (e) => {
    e.preventDefault(); setMsg({ t: '', bad: false });
    try { await api('/admin/settings', { method: 'PUT', body: f }); setMsg({ t: 'Saved. Visitors see changes on their next page load.', bad: false }); }
    catch (x) { setMsg({ t: [x.message, ...Object.values(x.fields || {})].join(' · '), bad: true }); }
  };
  return (
    <form onSubmit={save} className="max-w-2xl space-y-5">
      <h1 className="font-display text-4xl">Website settings</h1>
      {top.map(([k, l, h]) => <Field key={k} label={l} hint={h}><input className={input} value={f[k] || ''} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></Field>)}
      {social.map((k) => <Field key={k} label={`${k[0].toUpperCase()}${k.slice(1)} link`}><input className={input} placeholder="https://" value={f.social[k] || ''} onChange={(e) => setF({ ...f, social: { ...f.social, [k]: e.target.value } })} /></Field>)}
      <Field label="About page text" hint="Write only what is true. Separate paragraphs with a blank line."><textarea rows={8} className={input} value={f.aboutText || ''} onChange={(e) => setF({ ...f, aboutText: e.target.value })} /></Field>
      {msg.t && <p role={msg.bad ? 'alert' : 'status'} className={`text-sm ${msg.bad ? 'text-red-700' : 'text-olive'}`}>{msg.t}</p>}
      <button className="btn-primary">Save settings</button>
    </form>
  );
}
