import crypto from 'crypto';

const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const makeReference = () => {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const r = Array.from(crypto.randomBytes(4), (b) => A[b % A.length]).join('');
  return `PP-${d}-${r}`;
};
