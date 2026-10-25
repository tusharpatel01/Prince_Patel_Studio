# Launch checklist

Tick each one on the LIVE site, not just locally.

**Accounts and settings**
- [ ] MongoDB Atlas cluster created, database user made, network access allows your API host
- [ ] Cloudinary account created, `CLOUDINARY_URL` set on the API host
- [ ] API deployed with `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET` (32+ random characters), `CLIENT_ORIGIN` = your exact site address
- [ ] `https://YOUR-API/api/health` returns `{"ok":true}`
- [ ] Frontend deployed on Vercel with `VITE_API_URL`, `VITE_SITE_URL`, WhatsApp, email and phone variables
- [ ] Admin account created (`npm run create-admin`), then `ADMIN_PASSWORD` removed from `.env`

**Try every important path**
- [ ] Sign in at `/admin/login` and stay signed in after a page refresh
- [ ] Send a test inquiry from Request a Quote (with a small image) and see it in Admin > Inquiries
- [ ] Complete the Requirement Builder; the WhatsApp button opens with the brief
- [ ] Create a quotation, download the PDF, and (if email is set up) send it to yourself
- [ ] Upload a real project image, publish the project, confirm it shows on the public site
- [ ] Export inquiries to CSV
- [ ] Open the site on a real phone: menu, forms, lightbox swipe

**Content that must be true before going public**
- [ ] Replace sample concept designs with genuine, approved work (or leave them labelled as concepts)
- [ ] Fill in the About text yourself; add no qualifications or numbers you cannot prove
- [ ] Enter estimator rates only if you have verified them; add package prices only if decided
- [ ] Have a professional review the Privacy Policy and Terms drafts
- [ ] Add testimonials only with written permission

**Search**
- [ ] Submit `https://YOUR-SITE/sitemap.xml` in Google Search Console
- [ ] Redeploy the frontend after publishing new projects, services or guides so the sitemap includes them
