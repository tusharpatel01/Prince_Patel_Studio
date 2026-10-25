# Prince Patel Studio: API

    cp .env.example .env     # fill MONGODB_URI, JWT_SECRET (32+ chars), CLIENT_ORIGIN
    npm install
    npm run create-admin     # uses ADMIN_EMAIL / ADMIN_PASSWORD from .env, then remove the password from .env
    npm run dev

Public: `POST /api/inquiries` (multipart: `data` JSON + up to 3 `files`).
Admin (cookie auth): `/api/auth/login|logout|me`, `/api/admin/inquiries` (list, `export.csv`, get, patch, notes).

Production: set `NODE_ENV=production` and `CLIENT_ORIGIN` to your Vercel URL(s). The auth cookie is then `Secure; SameSite=None`, which cross-origin hosting requires (HTTPS only).

## Estimator and packages (Phase 4)
No construction rates or prices are built in. Until the Phase 5 admin screens exist:
- Estimator: copy `estimator.template.json`, fill in your own verified rates, run `npm run set-estimator -- yourfile.json`.
- Packages: `POST /api/admin/packages` (signed in). Only `published: true` packages show on the site.

## Quotations and stats (Phase 5A)
- `GET /api/admin/stats`, `/api/admin/quotes` (list, create from inquiry, edit draft, status, PDF, send).
- Email sending needs SMTP_* and MAIL_FROM. Without them, download the PDF and mark the quote as Sent manually.

## Content management (Phase 5B)
Public (published only): `/api/projects`, `/services`, `/faqs`, `/testimonials`, `/posts`, `/posts/:slug`, `/settings`.
Admin: the same paths under `/api/admin` (create, update, delete), plus `/api/admin/media` (image upload and library; needs `CLOUDINARY_URL`).
Removing an image from a project does not delete it from the library; delete it from the Media page.
