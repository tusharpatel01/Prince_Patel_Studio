import { ZodError } from 'zod';
import multer from 'multer';

export const notFound = (req, res) => res.status(404).json({ message: 'Not found' });

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    const errors = {};
    for (const i of err.issues) errors[i.path.join('.') || 'form'] ??= i.message;
    return res.status(400).json({ message: 'Please check the highlighted fields', errors });
  }
  if (err instanceof multer.MulterError) return res.status(400).json({ message: err.code === 'LIMIT_FILE_SIZE' ? 'A file is too large' : 'Too many files' });
  if (err.message?.startsWith('Only JPG')) return res.status(400).json({ message: err.message });
  if (err.name === 'CastError') return res.status(404).json({ message: 'Not found' });
  console.error(err);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
};
