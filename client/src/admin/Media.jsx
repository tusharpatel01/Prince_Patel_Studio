import { useState } from 'react';
import { useLoad, State } from './ui';
import { api } from '../lib/adminApi';
import { uploadMedia } from './ImagesField';

export default function Media() {
  const { data, error, loading, reload } = useLoad('/admin/media');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const up = async (e) => { setMsg(''); setBusy(true); try { await uploadMedia(e.target.files); reload(); } catch (x) { setMsg(x.message); } finally { setBusy(false); e.target.value = ''; } };
  const del = async (m) => { if (!window.confirm('Delete this image? Projects using it will show a broken image.')) return; try { await api(`/admin/media/${m._id}`, { method: 'DELETE' }); reload(); } catch (x) { setMsg(x.message); } };
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="font-display text-4xl">Media library</h1>
        <label className="btn-primary cursor-pointer">{busy ? 'Uploading...' : 'Upload images'}<input type="file" multiple accept=".jpg,.jpeg,.png,.webp" className="sr-only" onChange={up} disabled={busy} /></label></div>
      <p className="mt-2 text-sm text-muted">JPG, PNG or WebP, up to 8 MB each. Add images to a project from the project editor.</p>
      {msg && <p role="alert" className="mt-3 text-sm text-red-700">{msg}</p>}
      <div className="mt-6"><State loading={loading} error={error} />
        {data && (data.length === 0 ? <p className="text-muted">No images uploaded yet.</p> : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{data.map((m) => (
            <li key={m._id} className="border border-stone bg-white p-2"><img src={m.url} alt={m.name || ''} loading="lazy" className="aspect-[4/3] w-full object-cover" /><p className="mt-2 truncate text-xs text-muted">{m.name}</p>
              <div className="mt-1 flex gap-3 text-xs"><button className="underline" onClick={() => navigator.clipboard?.writeText(m.url)}>Copy URL</button><button className="underline" onClick={() => del(m)}>Delete</button></div></li>
          ))}</ul>
        ))}
      </div>
    </div>
  );
}
