import mongoose from 'mongoose';

export const QUOTE_STATUSES = ['Draft', 'Sent', 'Accepted', 'Rejected'];

export default mongoose.model('Quote', new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  inquiry: { type: mongoose.Schema.Types.ObjectId, ref: 'Inquiry', required: true, index: true },
  status: { type: String, enum: QUOTE_STATUSES, default: 'Draft', index: true },
  currency: { type: String, default: 'INR' },
  lineItems: [{ description: String, qty: { type: Number, default: 1 }, unitPrice: { type: Number, default: 0 } }],
  taxPercent: { type: Number, default: 0 },
  scope: String,
  exclusions: String,
  revisions: String,
  validUntil: Date,
  sentAt: Date,
  emailStatus: { type: String, enum: ['not_sent', 'sent', 'failed'], default: 'not_sent' },
  emailError: String,
}, { timestamps: true }));
