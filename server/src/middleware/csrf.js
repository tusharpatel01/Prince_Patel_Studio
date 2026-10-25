import { config } from '../config.js';

// The admin cookie is SameSite=None in production, so refuse state-changing requests that a browser
// says came from some other website. Requests with no Origin header (curl, server-to-server) are not browser CSRF.
export const originGuard = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.headers.origin;
  if (origin && !config.origins.includes(origin)) return res.status(403).json({ message: 'Origin not allowed' });
  next();
};
