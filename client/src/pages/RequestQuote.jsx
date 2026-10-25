import { useSeo } from '../lib/seo';
import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Breadcrumbs from '../components/Breadcrumbs';
import Field, { input } from '../components/Field';
import { submitInquiry } from '../lib/api';
import { useContent } from '../content/ContentContext';
import { whatsappLink } from '../config/site';

const num = z.preprocess((v) => (v === '' || v == null ? undefined : v), z.coerce.number().positive().optional());
const schema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  phone: z.string().transform((s) => s.replace(/[\s\-()]/g, '')).pipe(z.string().regex(/^\+?\d{7,15}$/, 'Enter a valid phone number')),
  email: z.string().trim().email('Enter a valid email').or(z.literal('')),
  location: z.string().trim().min(2, 'Enter your city or project location'),
  propertyType: z.string().optional(),
  plotWidth: num, plotLength: num,
  unit: z.enum(['ft', 'm']),
  floors: num,
  services: z.array(z.string()).min(1, 'Choose at least one service'),
  budget: z.string().optional(), timeline: z.string().optional(),
  preferredContact: z.string().optional(),
  message: z.string().max(2000).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please accept the privacy notice' }) }),
  website: z.string().optional(),
});

const types = ['Independent house', 'Duplex', 'Villa', 'Apartment-related consultation', 'Commercial building', 'Other'];
const budgets = ['Not sure yet', 'Under 5 lakh', '5 to 15 lakh', '15 to 50 lakh', 'Above 50 lakh'];
const timelines = ['Flexible', 'Within a month', '1 to 3 months', '3 to 6 months'];

export default function RequestQuote() {
  const { services, projects } = useContent();
  useSeo('Request a Quote', 'Request a quotation for 2D floor plans, 3D elevations or interior visualization.');
  const [sp] = useSearchParams();
  const [done, setDone] = useState(null);
  const [error, setError] = useState('');
  const [files, setFiles] = useState([]);
  const pre = sp.get('service');
  const project = projects.find((p) => p.slug === sp.get('project'));
  const { register, handleSubmit, setError: setFieldError, getValues, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { unit: 'ft', services: services.some((s) => s.slug === pre) ? [pre] : [], message: project ? `I'd like a design similar to "${project.title}".` : '', preferredContact: 'WhatsApp', consent: false, website: '' },
  });

  const onSubmit = async (v) => {
    setError('');
    try { setDone(await submitInquiry({ ...v, source: 'quote' }, files)); }
    catch (e) {
      setError(e.message);
      Object.entries(e.fields || {}).forEach(([k, m]) => setFieldError(k, { message: m }));
    }
  };

  if (done) {
    const v = getValues();
    const brief = `Hello Prince, I sent an inquiry (ref ${done.reference}). Plot: ${v.plotWidth || '?'} x ${v.plotLength || '?'} ${v.unit}, floors: ${v.floors || '?'}, services: ${v.services.map((s) => services.find((x) => x.slug === s)?.title || s).join(', ')}.`;
    const wa = whatsappLink(brief);
    return (
      <section className="container-x py-20">
        <h1 className="font-display text-5xl">Inquiry received</h1>
        <p className="mt-4 text-muted">Your reference number is</p>
        <p className="mt-1 text-2xl font-medium tracking-wide">{done.reference}</p>
        <p className="mt-4 max-w-lg text-muted">Keep this number. Prince will contact you using your preferred method.</p>
        {done.filesFailed && <p role="status" className="mt-4 max-w-lg border-l-2 border-stone pl-3 text-sm text-muted">Your inquiry was saved, but the attached files could not be uploaded. Please send them on WhatsApp.</p>}
        <div className="mt-8 flex flex-wrap gap-3">
          {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-primary">Send details on WhatsApp</a>}
          <Link to="/" className="btn-outline">Back to home</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container-x py-16">
      <Breadcrumbs trail={[['Request a Quote']]} />
      <h1 className="mt-6 font-display text-5xl md:text-6xl">Request a Quote</h1>
      <p className="mt-3 max-w-xl text-muted">Tell us about your plot and what you need. A quotation is prepared after we understand your requirements. Only name, phone, location and service are required.</p>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-10 grid max-w-3xl gap-6 md:grid-cols-2">
        <Field label="Name" error={errors.name?.message}><input className={input} autoComplete="name" {...register('name')} /></Field>
        <Field label="Phone" error={errors.phone?.message}><input className={input} type="tel" autoComplete="tel" {...register('phone')} /></Field>
        <Field label="Email (optional)" error={errors.email?.message}><input className={input} type="email" autoComplete="email" {...register('email')} /></Field>
        <Field label="City or project location" error={errors.location?.message}><input className={input} {...register('location')} /></Field>
        <Field label="Property type"><select className={input} {...register('propertyType')}><option value="">Select</option>{types.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Floors"><input className={input} type="number" min="1" {...register('floors')} /></Field>
        <Field label="Plot width"><input className={input} type="number" min="0" step="any" {...register('plotWidth')} /></Field>
        <Field label="Plot length"><input className={input} type="number" min="0" step="any" {...register('plotLength')} /></Field>
        <Field label="Unit"><select className={input} {...register('unit')}><option value="ft">Feet</option><option value="m">Meters</option></select></Field>
        <Field label="Preferred contact"><select className={input} {...register('preferredContact')}><option>WhatsApp</option><option>Phone call</option><option>Email</option></select></Field>
        <fieldset className="md:col-span-2">
          <legend className="text-sm font-medium">Services needed</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {[...services.map((s) => [s.slug, s.title]), ['other', 'Other']].map(([v, l]) => (
              <label key={v} className="flex items-center gap-2 text-sm"><input type="checkbox" value={v} {...register('services')} /> {l}</label>
            ))}
          </div>
          {errors.services && <span role="alert" className="mt-1 block text-xs text-red-700">{errors.services.message}</span>}
        </fieldset>
        <Field label="Budget range (optional)"><select className={input} {...register('budget')}><option value="">Select</option>{budgets.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Timeline (optional)"><select className={input} {...register('timeline')}><option value="">Select</option>{timelines.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <div className="md:col-span-2"><Field label="Additional requirements" error={errors.message?.message}><textarea rows={4} className={input} {...register('message')} /></Field></div>
        <div className="md:col-span-2">
          <Field label="Reference files (optional)" hint="Plot sketch or inspiration. JPG, PNG, WebP or PDF, up to 3 files, 5 MB each.">
            <input type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 3))} />
          </Field>
        </div>
        <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px]" {...register('website')} />
        <div className="md:col-span-2">
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" {...register('consent')} /> <span>I agree to the <Link to="/privacy" className="underline">privacy notice</Link> and to being contacted about this inquiry.</span></label>
          {errors.consent && <span role="alert" className="mt-1 block text-xs text-red-700">{errors.consent.message}</span>}
        </div>
        {error && <p role="alert" className="md:col-span-2 border border-red-700 bg-white p-3 text-sm text-red-700">{error}</p>}
        <div className="md:col-span-2"><button disabled={isSubmitting} className="btn-primary disabled:opacity-60">{isSubmitting ? 'Sending...' : 'Send inquiry'}</button></div>
      </form>
    </section>
  );
}
