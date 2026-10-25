import mongoose from 'mongoose';

export const STATUSES = ['New', 'Contacted', 'Consultation Scheduled', 'Quote Sent', 'Approved', 'In Progress', 'Completed', 'Closed'];

const schema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  source: { type: String, enum: ['quote', 'contact', 'builder'], default: 'quote' },
  name: { type: String, required: true },
  phone: { type: String, required: true, index: true },
  email: String,
  location: String,
  propertyType: String,
  plotWidth: Number,
  plotLength: Number,
  unit: { type: String, enum: ['ft', 'm'], default: 'ft' },
  floors: Number,
  bedrooms: Number,
  bathrooms: Number,
  roadFacing: String,
  style: String,
  requirements: String,
  brief: String,
  services: [String],
  budget: String,
  timeline: String,
  preferredContact: String,
  message: String,
  files: [{ url: String, name: String }],
  consentAt: { type: Date, required: true },
  status: { type: String, enum: STATUSES, default: 'New', index: true },
  notes: [{ text: String, at: { type: Date, default: Date.now } }], // private, admin only
  followUpDate: Date,
  archived: { type: Boolean, default: false, index: true },
}, { timestamps: true });

export default mongoose.model('Inquiry', schema);
