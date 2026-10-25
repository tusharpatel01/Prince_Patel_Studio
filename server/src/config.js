import 'dotenv/config';

const required = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_ORIGIN'];
for (const k of required) if (!process.env[k]) throw new Error(`Missing environment variable: ${k}`);
if (process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters');

export const config = {
  port: +process.env.PORT || 5000,
  prod: process.env.NODE_ENV === 'production',
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  origins: process.env.CLIENT_ORIGIN.split(',').map((s) => s.trim()),
  uploadsEnabled: !!process.env.CLOUDINARY_URL,
};
