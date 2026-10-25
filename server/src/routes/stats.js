import { Router } from 'express';
import Inquiry, { STATUSES } from '../models/Inquiry.js';
import Quote, { QUOTE_STATUSES } from '../models/Quote.js';
import { requireAdmin } from '../middleware/auth.js';

const r = Router();
r.use(requireAdmin);
const toMap = (rows, keys) => Object.fromEntries(keys.map((k) => [k, rows.find((x) => x._id === k)?.n || 0]));

// Every number here is counted from stored data. Nothing is estimated or invented.
r.get('/stats', async (req, res, next) => {
  try {
    const live = { archived: false };
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
    const [total, byStatus, quoteRows, recent, followUps, svc, monthRows] = await Promise.all([
      Inquiry.countDocuments(live),
      Inquiry.aggregate([{ $match: live }, { $group: { _id: '$status', n: { $sum: 1 } } }]),
      Quote.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
      Inquiry.find(live).sort({ createdAt: -1 }).limit(5).select('reference name status createdAt'),
      Inquiry.find({ ...live, followUpDate: { $ne: null }, status: { $nin: ['Completed', 'Closed'] } }).sort({ followUpDate: 1 }).limit(8).select('reference name followUpDate status'),
      Inquiry.aggregate([{ $match: live }, { $unwind: '$services' }, { $group: { _id: '$services', n: { $sum: 1 } } }, { $sort: { n: -1 } }]),
      Inquiry.aggregate([{ $match: { ...live, createdAt: { $gte: start } } }, { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, n: { $sum: 1 } } }]),
    ]);
    const status = toMap(byStatus, STATUSES);
    const quotes = toMap(quoteRows, QUOTE_STATUSES);
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
      const key = d.toISOString().slice(0, 7);
      return { month: key, count: monthRows.find((m) => m._id === key)?.n || 0 };
    });
    res.json({
      total, new: status.New, byStatus: status, quotesByStatus: quotes,
      quotesSent: quotes.Sent + quotes.Accepted + quotes.Rejected,
      approvedProjects: status.Approved + status['In Progress'] + status.Completed,
      recent, followUps, services: svc.map((s) => ({ service: s._id, count: s.n })), months,
    });
  } catch (e) { next(e); }
});

export default r;
