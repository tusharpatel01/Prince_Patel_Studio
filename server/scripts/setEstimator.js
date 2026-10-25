// Usage: npm run set-estimator -- path/to/estimator.json   (until the Phase 5 admin screen exists)
import 'dotenv/config';
import fs from 'fs';
import mongoose from 'mongoose';
import { Estimator } from '../src/models/Content.js';
import { estimatorSchema } from '../src/lib/estimatorSchema.js';

const file = process.argv[2];
if (!file) throw new Error('Pass the path to your estimator JSON file');
const data = estimatorSchema.parse(JSON.parse(fs.readFileSync(file, 'utf8')));
await mongoose.connect(process.env.MONGODB_URI);
await Estimator.findOneAndUpdate({}, { data }, { upsert: true });
console.log(`Estimator saved: ${data.locations.length} locations, ${data.allowances.length} allowances`);
await mongoose.disconnect();
