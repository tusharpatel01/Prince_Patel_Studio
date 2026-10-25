import { site } from '../config/site';

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${site.apiUrl}${path}`, {
    method, credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(json.message || 'Request failed'), { status: res.status });
  return json;
}
export const apiUrl = (p) => `${site.apiUrl}${p}`;
