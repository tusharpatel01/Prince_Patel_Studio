import mongoose from 'mongoose';

const model = (name, def) => mongoose.model(name, new mongoose.Schema(def, { timestamps: true }));
const pub = { published: { type: Boolean, default: false }, order: { type: Number, default: 0 } };

export const Project = model('Project', {
  title: { type: String, required: true }, slug: { type: String, required: true, unique: true },
  category: String, propertyType: String, style: String, plotWidth: Number, plotLength: Number, unit: { type: String, default: 'ft' },
  floors: Number, bedrooms: Number, status: { type: String, default: 'Concept' }, description: String,
  highlights: [String], requirements: [String], tags: [String],
  images: [{ url: String, caption: String, kind: String }], coverIndex: { type: Number, default: 0 }, ...pub,
});
export const Service = model('Service', {
  title: { type: String, required: true }, slug: { type: String, required: true, unique: true }, art: { type: String, default: 'plan' },
  short: String, desc: String, suitable: [String], deliverables: [String], prepare: [String], faqs: [{ q: String, a: String }], ...pub,
});
export const Faq = model('Faq', { question: { type: String, required: true }, answer: { type: String, required: true }, ...pub });
export const Testimonial = model('Testimonial', { name: { type: String, required: true }, role: String, text: { type: String, required: true }, permission: { type: Boolean, default: false }, ...pub });
export const Post = model('Post', { title: { type: String, required: true }, slug: { type: String, required: true, unique: true }, excerpt: String, body: String, publishedAt: Date, ...pub });
export const Media = model('Media', { url: { type: String, required: true }, publicId: String, name: String });
export const Settings = model('Settings', { data: Object });
