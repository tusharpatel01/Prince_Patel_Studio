import mongoose from 'mongoose';
import cloudinary from './lib/cloud.js';
import { config } from './config.js';
import app from './app.js';

try {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
} catch (e) {
  console.error('Could not connect to MongoDB:', e.message);
  process.exit(1);
}
const server = app.listen(config.port, () => console.log(`API listening on :${config.port}`));
if (config.uploadsEnabled) {
  Promise.resolve().then(() => cloudinary.api.ping())
    .then(() => console.log('Cloudinary connected'))
    .catch((e) => console.warn(`Cloudinary check failed (HTTP ${e.http_code || e.error?.http_code || '?'}). Uploads will not work until CLOUDINARY_URL is fixed. Run "npm run check-cloudinary".`));
} else console.log('Cloudinary not configured: file and image uploads are off');
const stop = () => server.close(() => mongoose.disconnect().then(() => process.exit(0)));
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
