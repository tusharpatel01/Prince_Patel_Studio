import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import Admin from '../models/Admin.js';
import { config } from '../config.js';
import { COOKIE, cookieOpts, requireAdmin } from '../middleware/auth.js';

const r = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many attempts. Try again later.' } });
const DUMMY = bcrypt.hashSync('not-a-real-password', 12); // keeps timing similar when the email is unknown

r.post('/login', limiter, async (req, res, next) => {
  try {
    const { email, password } = z.object({ email: z.string().email(), password: z.string().min(1).max(200) }).parse(req.body);
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    const ok = await bcrypt.compare(password, admin?.passwordHash || DUMMY);
    if (!admin || !ok) return res.status(401).json({ message: 'Incorrect email or password' });
    const token = jwt.sign({ id: admin.id, email: admin.email }, config.jwtSecret, { expiresIn: '8h' });
    res.cookie(COOKIE, token, cookieOpts).json({ email: admin.email });
  } catch (e) { next(e); }
});

r.post('/logout', (req, res) => res.clearCookie(COOKIE, { ...cookieOpts, maxAge: undefined }).json({ ok: true }));
r.get('/me', requireAdmin, (req, res) => res.json({ email: req.admin.email }));

export default r;
