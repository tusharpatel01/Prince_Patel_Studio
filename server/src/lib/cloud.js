import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary explicitly from CLOUDINARY_URL so it never depends on import order.
const m = (process.env.CLOUDINARY_URL || '').match(/^cloudinary:\/\/([^:\s<>]+):([^@\s<>]+)@([^\s<>/]+)$/);
if (m) cloudinary.config({ api_key: m[1], api_secret: m[2], cloud_name: m[3], secure: true });

export default cloudinary;
