import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { originGuard } from './middleware/csrf.js';
import { config } from './config.js';
import auth from './routes/auth.js';
import inquiries from './routes/inquiries.js';
import admin from './routes/admin.js';
import { publicCms, adminCms } from './routes/cms.js';
import media from './routes/media.js';
import quotes from './routes/quotes.js';
import stats from './routes/stats.js';
import { publicRouter, adminRouter } from './routes/content.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();
app.set('trust proxy', 1); // so rate limits see the real client IP behind the host's proxy
app.use(helmet());
app.use(cors({ origin: config.origins, credentials: true }));
app.use(originGuard);
app.use(express.json({ limit: '50kb' }));
app.use(cookieParser());
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: true, legacyHeaders: false }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', auth);
app.use('/api/inquiries', inquiries);
app.use('/api', publicRouter);
app.use('/api', publicCms);
app.use('/api/admin', admin);
app.use('/api/admin', adminRouter);
app.use('/api/admin', stats);
app.use('/api/admin', quotes);
app.use('/api/admin', adminCms);
app.use('/api/admin', media);
app.use(notFound);
app.use(errorHandler);

export default app;
