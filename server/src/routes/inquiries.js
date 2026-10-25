import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import Inquiry from '../models/Inquiry.js';
import { inquirySchema } from '../lib/schema.js';
import { makeBrief } from '../lib/brief.js';
import { makeReference } from '../lib/reference.js';
import { upload, looksValid, saveFile } from '../lib/upload.js';
import { config } from '../config.js';

const r = Router();
const limiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 8, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many submissions. Please try again in an hour.' } });

r.post('/', limiter, upload.array('files', 3), async (req, res, next) => {
  try {
    let raw;
    try { raw = JSON.parse(req.body.data ?? JSON.stringify(req.body)); } catch { return res.status(400).json({ message: 'Invalid form data' }); }
    const d = inquirySchema.parse(raw);

    // Bots fill the hidden field. Pretend it worked so they don't retry.
    if (d.website) return res.status(201).json({ reference: makeReference() });

    // Same phone, same message within 10 minutes is almost certainly a double click.
    const dup = await Inquiry.findOne({ phone: d.phone, message: d.message, createdAt: { $gt: new Date(Date.now() - 10 * 60 * 1000) } });
    if (dup) return res.status(200).json({ reference: dup.reference, brief: dup.brief, duplicate: true });

    const files = req.files || [];
    if (files.length && !files.every(looksValid)) return res.status(400).json({ message: 'One of the files is not a valid image or PDF' });

    // A problem with attachments must never lose the inquiry itself.
    let saved = [];
    let filesFailed = false;
    if (files.length) {
      if (!config.uploadsEnabled) filesFailed = true;
      else {
        try { saved = await Promise.all(files.map(saveFile)); }
        catch (e) { filesFailed = true; console.error(`Cloudinary upload failed (HTTP ${e.http_code || '?'}): ${e.message}. Run "npm run check-cloudinary" to test your CLOUDINARY_URL.`); }
      }
    }

    const { consent, website, ...fields } = d;
    let inquiry;
    for (let i = 0; i < 3 && !inquiry; i++) {
      try { inquiry = await Inquiry.create({ ...fields, brief: makeBrief(d), files: saved, consentAt: new Date(), reference: makeReference() }); }
      catch (e) { if (e.code !== 11000 || i === 2) throw e; } // reference collision: retry
    }
    res.status(201).json({ reference: inquiry.reference, brief: inquiry.brief, filesFailed });
  } catch (e) { next(e); }
});

export default r;
