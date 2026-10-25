import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export const COOKIE = 'pp_admin';
// Frontend and API live on different origins in production, so the cookie must be SameSite=None; Secure.
export const cookieOpts = { httpOnly: true, secure: config.prod, sameSite: config.prod ? 'none' : 'lax', maxAge: 8 * 60 * 60 * 1000, path: '/' };

export const requireAdmin = (req, res, next) => {
  try {
    req.admin = jwt.verify(req.cookies[COOKIE], config.jwtSecret);
    next();
  } catch {
    res.status(401).json({ message: 'Please sign in' });
  }
};
