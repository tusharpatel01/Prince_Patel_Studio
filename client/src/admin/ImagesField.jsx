import { useState } from 'react';
import { site } from '../config/site';
import { api } from '../lib/adminApi';

export async function uploadMedia(files) {
  const body = new FormData();
  Array.from(files).forEach((f) => body.append('files', f));
  const res = await fetch(`${site.apiUrl}/admin/media`, { method: 'POST', body, credentials: 'include' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Upload failed');
  return json.items;
}

const KINDS = [['plan', '2D plan'], ['elevation', '3D elevation'], ['interior', 'Interior'], ['sketch', 'Sketch']];
const small = 'border border-stone bg-white px-2 py-1 text-sm';

export default function ImagesField({ images, cover, onChange }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [lib, setLib] = useState(null);
  const set = (imgs, c = cover) => onChange({ images: imgs, coverIndex: Math.min(c, Math.max(0, imgs.length - 1)) });
  const add = (items) => set([...images, ...items.map((m) => ({ url: m.url, caption: '', kind: 'elevation' }))]);
  const up = async (e) => { setErr(''); setBusy(true); try { add(await uploadMedia(e.target.files)); } catch (x) { setErr(x.message); } finally { setBusy(false); e.target.value = ''; } };
  const edit = (i, k, v) => set(images.map((m, n) => (n === i ? { ...m, [k]: v } : m)));
  const move = (i, d) => {
    const j = i + d; if (j < 0 || j >= images.length) return;
    const a = [...images]; [a[i], a[j]] = [a[j], a[i]];
    set(a, cover === i ? j : cover === j ? i : cover);
  };
  const remove = (i) => set(images.filter((_, n) => n !== i), i < cover ? cover - 1 : i === cover ? 0 : cover);

  return (
    <div>
      {images.length === 0 && <p className="text-sm text-muted">No images yet.</p>}
      <ul className="space-y-3">
        {images.map((m, i) => (
          <li key={m.url + i} className="grid grid-cols-[5rem_1fr] gap-3 border border-stone bg-white p-2">
            <img src={m.url} alt="" className="h-16 w-20 object-cover" />
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <select className={small} aria-label="Image type" value={m.kind} onChange={(e) => edit(i, 'kind', e.target.value)}>{KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                <input className={`${small} min-w-0 flex-1`} aria-label="Caption and alt text" placeholder="Caption (also used as alt text)" value={m.caption} onChange={(e) => edit(i, 'caption', e.target.value)} />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <label className="flex items-center gap-1"><input type="radio" name="cover" checked={cover === i} onChange={() => set(images, i)} /> Cover</label>
                <button type="button" className="underline" onClick={() => move(i, -1)}>Up</button>
                <button type="button" className="underline" onClick={() => move(i, 1)}>Down</button>
                <button type="button" className="underline" onClick={() => remove(i)}>Remove</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
        <label className="btn-outline cursor-pointer">{busy ? 'Uploading...' : 'Upload images'}<input type="file" multiple accept=".jpg,.jpeg,.png,.webp" className="sr-only" onChange={up} disabled={busy} /></label>
        <button type="button" className="underline" onClick={() => (lib ? setLib(null) : api('/admin/media').then(setLib).catch((x) => setErr(x.message)))}>{lib ? 'Hide library' : 'Pick from library'}</button>
      </div>
      {err && <p role="alert" className="mt-2 text-sm text-red-700">{err}</p>}
      {lib && <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">{lib.length === 0 ? <p className="col-span-full text-sm text-muted">Library is empty.</p> : lib.map((m) => <button type="button" key={m._id} onClick={() => add([m])}><img src={m.url} alt={m.name || ''} className="aspect-square w-full object-cover" /></button>)}</div>}
    </div>
  );
}
