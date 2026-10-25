import { site } from '../config/site';

export async function submitInquiry(values, files = []) {
  const body = new FormData();
  body.append('data', JSON.stringify(values));
  files.forEach((f) => body.append('files', f));
  const res = await fetch(`${site.apiUrl}/inquiries`, { method: 'POST', body });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(json.message || 'Could not send your inquiry'), { fields: json.errors });
  return json; // { reference }
}

export async function getJson(path) {
  const res = await fetch(`${site.apiUrl}${path}`);
  if (!res.ok) throw new Error('Could not load data');
  return res.json();
}
