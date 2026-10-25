// Usage: npm run check-cloudinary   (reads CLOUDINARY_URL from server/.env)
import 'dotenv/config';
import cloudinary from '../src/lib/cloud.js';

const url = process.env.CLOUDINARY_URL;
if (!url) { console.log('CLOUDINARY_URL is not set in server/.env'); process.exit(1); }
const m = url.match(/^cloudinary:\/\/([^:\s<>]+):([^@\s<>]+)@([^\s<>/]+)$/);
if (!m) {
  console.log('CLOUDINARY_URL looks wrong. It must be exactly:\n  CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME\nNo quotes, no spaces, no < > brackets, and the real secret (not the text <your_api_secret>).');
  process.exit(1);
}
console.log(`Cloud name: ${m[3]} | API key starts with: ${m[1].slice(0, 4)} | secret: hidden`);
const code = (e) => e.http_code || e.error?.http_code || '?';
const msg = (e) => e.message || e.error?.message || String(e);

try { await cloudinary.api.ping(); console.log('1. Credentials: OK'); }
catch (e) { console.log(`1. Credentials: FAILED (HTTP ${code(e)}) ${msg(e)}`); }

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
try {
  const r = await new Promise((resolve, reject) => cloudinary.uploader.upload_stream({ folder: 'prince-patel/_test', resource_type: 'image' }, (err, res) => (err ? reject(err) : resolve(res))).end(png));
  console.log('2. Test upload: OK');
  await cloudinary.uploader.destroy(r.public_id);
  console.log('3. Test file removed: OK');
} catch (e) { console.log(`2. Test upload: FAILED (HTTP ${code(e)}) ${msg(e)}`); }
