import mongoose from 'mongoose';

// One document holding the estimator settings the owner controls.
export const Estimator = mongoose.model('Estimator', new mongoose.Schema({ data: Object }, { timestamps: true }));

export const Package = mongoose.model('Package', new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  summary: String,
  quoteOnly: { type: Boolean, default: true },
  price: Number,
  currency: { type: String, default: 'INR' },
  deliverables: [String],
  revisions: String,
  deliveryRange: String,
  exclusions: [String],
  addons: [{ name: String, price: Number }],
  terms: String,
  published: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { timestamps: true }));
