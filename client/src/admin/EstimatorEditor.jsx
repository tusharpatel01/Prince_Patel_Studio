import { useEffect, useState } from 'react';
import { useLoad, State } from './ui';
import { api } from '../lib/adminApi';
import { input } from '../components/Field';

export default function EstimatorEditor() {
  const { data, error, loading } = useLoad('/estimator');
  const [text, setText] = useState('');
  const [msg, setMsg] = useState({ t: '', bad: false });
  useEffect(() => { if (data) setText(JSON.stringify(data.config, null, 2)); }, [data]);
  if (!data) return <State loading={loading} error={error} />;
  const save = async () => {
    setMsg({ t: '', bad: false });
    let body; try { body = JSON.parse(text); } catch { return setMsg({ t: 'This is not valid JSON. Check commas and quotes.', bad: true }); }
    try { await api('/admin/estimator', { method: 'PUT', body }); setMsg({ t: 'Saved. The estimator now uses these rates.', bad: false }); }
    catch (x) { setMsg({ t: [x.message, ...Object.entries(x.fields || {}).map(([k, v]) => `${k}: ${v}`)].join(' · '), bad: true }); }
  };
  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-4xl">Estimator assumptions</h1>
      <p className="mt-2 text-sm text-muted">Enter only rates you have verified for each city. A rate left as null is treated as not available. Set "includedInRate": true for any allowance your rate already covers, so it is not counted twice. {data.configured ? '' : 'Nothing is configured yet.'}</p>
      <textarea rows={26} spellCheck={false} className={`${input} mt-5 font-mono text-xs`} value={text} onChange={(e) => setText(e.target.value)} aria-label="Estimator configuration JSON" />
      {msg.t && <p role={msg.bad ? 'alert' : 'status'} className={`mt-3 text-sm ${msg.bad ? 'text-red-700' : 'text-olive'}`}>{msg.t}</p>}
      <button className="btn-primary mt-4" onClick={save}>Save estimator</button>
    </div>
  );
}
