import multer from 'multer';
import cloudinary from './cloud.js';

const MAGIC = { 'image/jpeg': [0xff, 0xd8, 0xff], 'image/png': [0x89, 0x50, 0x4e, 0x47], 'application/pdf': [0x25, 0x50, 0x44, 0x46] };
const isWebp = (b) => b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 3, fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    cb(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.mimetype) ? null : new Error('Only JPG, PNG, WebP or PDF files are allowed'), true),
});

// Check real file bytes, not just the type the browser claims.
export const looksValid = (f) => (f.mimetype === 'image/webp' ? isWebp(f.buffer) : MAGIC[f.mimetype]?.every((b, i) => f.buffer[i] === b));

export const saveFile = (f) => new Promise((resolve, reject) => {
  cloudinary.uploader.upload_stream({ folder: 'prince-patel/inquiries', resource_type: 'auto' }, (err, res) => (err ? reject(err) : resolve({ url: res.secure_url, name: f.originalname.slice(0, 100) }))).end(f.buffer);
});

// Admin portfolio uploads: images only, larger limit.
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 10, fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype) ? null : new Error('Only JPG, PNG or WebP images are allowed'), true),
});

export const saveImage = (f) => new Promise((resolve, reject) => {
  cloudinary.uploader.upload_stream({ folder: 'prince-patel/portfolio', resource_type: 'image' }, (err, res) => (err ? reject(err) : resolve({ url: res.secure_url, publicId: res.public_id, name: f.originalname.slice(0, 100) }))).end(f.buffer);
});
