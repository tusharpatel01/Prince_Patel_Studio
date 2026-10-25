import { Router } from 'express';
import cloudinary from '../lib/cloud.js';
import { Media } from '../models/Cms.js';
import { requireAdmin } from '../middleware/auth.js';
import { imageUpload, looksValid, saveImage } from '../lib/upload.js';
import { config } from '../config.js';

const r = Router();
r.use(requireAdmin);

r.get('/media', async (req, res, next) => { try { res.json(await Media.find().sort({ createdAt: -1 }).limit(300)); } catch (e) { next(e); } });

r.post('/media', imageUpload.array('files', 10), async (req, res, next) => {
  try {
    if (!config.uploadsEnabled) return res.status(503).json({ message: 'Image storage is not configured. Set CLOUDINARY_URL on the server.' });
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ message: 'Choose at least one image' });
    if (!files.every(looksValid)) return res.status(400).json({ message: 'One of the files is not a valid image' });
    res.status(201).json({ items: await Media.insertMany(await Promise.all(files.map(saveImage))) });
  } catch (e) { next(e); }
});

r.delete('/media/:id', async (req, res, next) => {
  try {
    const m = await Media.findByIdAndDelete(req.params.id);
    if (!m) return res.status(404).json({ message: 'Not found' });
    if (m.publicId && config.uploadsEnabled) await cloudinary.uploader.destroy(m.publicId).catch(() => {});
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default r;
