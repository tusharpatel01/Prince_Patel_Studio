import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from '../src/models/Admin.js';

const { ADMIN_EMAIL: email, ADMIN_PASSWORD: pw, MONGODB_URI } = process.env;
if (!email || !pw || !MONGODB_URI) throw new Error('Set ADMIN_EMAIL, ADMIN_PASSWORD and MONGODB_URI');
if (pw.length < 12) throw new Error('ADMIN_PASSWORD must be at least 12 characters');

await mongoose.connect(MONGODB_URI);
await Admin.findOneAndUpdate({ email: email.toLowerCase() }, { passwordHash: await bcrypt.hash(pw, 12) }, { upsert: true });
console.log(`Admin ready: ${email}`);
await mongoose.disconnect();
