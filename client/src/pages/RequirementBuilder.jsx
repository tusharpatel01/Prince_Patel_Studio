import { useSeo } from '../lib/seo';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Breadcrumbs from '../components/Breadcrumbs';
import Field, { input } from '../components/Field';
import { submitInquiry } from '../lib/api';
import { whatsappLink } from '../config/site';

const blank = (v) => (v === '' || v == null ? undefined : v);
const req = (msg) => z.coerce.number({ invalid_type_error: msg }).positive(msg);
const opt = z.preprocess(blank, z.coerce.number().min(0).max(30).optional());
const schema = z.object({
  propertyType: z.string().min(1, 'Choose a property type'),
  plotWidth: req('Enter plot width'), plotLength: req('Enter plot length'),
  unit: z.enum(['ft', 'm']),
  location: z.string().trim().min(2, 'Enter a city or location'),
  roadFacing: z.string().optional(),
  floors: req('Enter number of floors'),
  bedrooms: opt, bathrooms: opt,
  kitchen: z.string().optional(), living: z.string().optional(), parking: z.string().optional(),
  extras: z.array(z.string()).default([]),
  style: z.string().optional(),
  services: z.array(z.string()).min(1, 'Choose at least one service'),
  budget: z.string().optional(), timeline: z.string().optional(), message: z.string().max(1200).optional(),
  name: z.string().trim().min(2, 'Enter your name'),
  phone: z.string().transform((s) => s.replace(/[\s\-()]/g, '')).pipe(z.string().regex(/^\+?\d{7,15}$/, 'Enter a valid phone number')),
  email: z.string().trim().email('Enter a valid email').or(z.literal('')),
  preferredContact: z.string().optional(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please accept the privacy notice' }) }),
  website: z.string().optional(),
});

const types = ['Independent house', 'Duplex', 'Villa', 'Apartment-related design consultation', 'Commercial building', 'Other'];
const svc = [['2d-floor-plan', '2D plan'], ['3d-front-elevation', '3D elevation'], ['3d-interior-visualization', 'Interior visualization'], ['design-consultation', 'Consultation'], ['other', 'Other']];
const styles = ['Modern', 'Contemporary', 'Traditional', 'Minimalist', 'Other'];
const extras = ['Balcony', 'Terrace', 'Garden', 'Pooja room', 'Study', 'Store room'];
const steps = [
  ['Property', ['propertyType']],
  ['Plot', ['plotWidth', 'plotLength', 'unit', 'location', 'roadFacing']],
  ['Building', ['floors', 'bedrooms', 'bathrooms', 'kitchen', 'living', 'parking', 'extras']],
  ['Style', ['style', 'services']],
  ['Preferences', ['budget', 'timeline', 'message']],
  ['Contact', ['name', 'phone', 'email', 'preferredContact', 'consent']],
];
const sel = (opts) => <>{<option value="">Select</option>}{opts.map((o) => <option key={o}>{o}</option>)}</>;

export default function RequirementBuilder() {
  useSeo('House Design Requirement Builder', 'Answer a few questions to create a project brief for your house design.');
  const [step, setStep] = useState(0);
  const [plotFile, setPlotFile] = useState([]);
  const [refFiles, setRefFiles] = useState([]);
  const [done, setDone] = useState(null);
  const [error, setError] = useState('');
  const { register, handleSubmit, trigger, watch, setError: setFieldError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema), shouldUnregister: false,
    defaultValues: { unit: 'ft', extras: [], services: [], preferredContact: 'WhatsApp', consent: false, website: '' },
  });
  const v = watch();
  const last = steps.length; // index of the review screen

  const next = async () => { if (await trigger(steps[step][1])) setStep(step + 1); };
  const submit = async (d) => {
    setError('');
    const requirements = [d.kitchen && `Kitchen: ${d.kitchen}`, d.living && `Living and dining: ${d.living}`, d.parking && `Parking: ${d.parking}`, d.extras.length && `Extras: ${d.extras.join(', ')}`].filter(Boolean).join('. ');
    try { setDone(await submitInquiry({ ...d, source: 'builder', requirements }, [...plotFile, ...refFiles].slice(0, 3))); }
    catch (e) {
      setError(e.message);
      const bad = Object.keys(e.fields || {});
      bad.forEach((k) => setFieldError(k, { message: e.fields[k] }));
      const s = steps.findIndex(([, f]) => f.some((x) => bad.includes(x)));
      if (s >= 0) setStep(s);
    }
  };

  if (done) {
    const wa = whatsappLink(`Hello Prince, I sent a design inquiry (ref ${done.reference}).\n\n${done.brief}`);
    return (
      <section className="container-x py-20">
        <h1 className="font-display text-5xl">Requirements received</h1>
        <p className="mt-4 text-muted">Reference number</p><p className="text-2xl font-medium tracking-wide">{done.reference}</p>
        <h2 className="mt-8 font-medium">Your project brief</h2>
        <pre className="mt-2 max-w-xl whitespace-pre-wrap border border-stone bg-white p-4 font-sans text-sm">{done.brief}</pre>
        {done.filesFailed && <p role="status" className="mt-4 max-w-xl border-l-2 border-stone pl-3 text-sm text-muted">Your inquiry was saved, but the attached files could not be uploaded. Please send them on WhatsApp.</p>}
        <p className="mt-4 max-w-xl text-sm text-muted">This is a summary of what you told us. It is not a drawing; Prince will follow up to discuss your design.</p>
        <div className="mt-6 flex flex-wrap gap-3">{wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-primary">Send on WhatsApp</a>}<Link to="/" className="btn-outline">Back to home</Link></div>
      </section>
    );
  }

  const review = [['Property', v.propertyType], ['Plot', `${v.plotWidth} x ${v.plotLength} ${v.unit}, ${v.location}${v.roadFacing ? `, road-facing ${v.roadFacing}` : ''}`, 1],
    ['Building', [`${v.floors} floors`, v.bedrooms && `${v.bedrooms} bedrooms`, v.bathrooms && `${v.bathrooms} bathrooms`, v.kitchen, v.living, v.parking && `Parking: ${v.parking}`, ...(v.extras || [])].filter(Boolean).join(', '), 2],
    ['Style and services', [v.style, ...(v.services || []).map((s) => svc.find((x) => x[0] === s)?.[1])].filter(Boolean).join(', '), 3],
    ['Preferences', [v.budget, v.timeline, v.message].filter(Boolean).join(' | ') || 'None given', 4], ['Contact', `${v.name}, ${v.phone}${v.email ? `, ${v.email}` : ''}`, 5]];

  return (
    <section className="container-x py-16">
      <Breadcrumbs trail={[['House Design Requirement Builder']]} />
      <h1 className="mt-6 font-display text-5xl md:text-6xl">House Design Requirement Builder</h1>
      <p className="mt-3 max-w-xl text-muted">Answer a few questions and we'll prepare a project brief to discuss. This does not generate construction drawings.</p>
      <ol className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Progress">
        {[...steps.map((s) => s[0]), 'Review'].map((l, i) => <li key={l} aria-current={i === step ? 'step' : undefined} className={i === step ? 'border-b-2 border-charcoal font-medium' : i < step ? '' : 'text-muted'}>{i + 1}. {l}</li>)}
      </ol>

      <form onSubmit={handleSubmit(submit)} noValidate className="mt-10 max-w-2xl">
        <div hidden={step !== 0}><fieldset><legend className="font-display text-3xl">What are you planning?</legend>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">{types.map((t) => <label key={t} className={`cursor-pointer border p-4 text-sm ${v.propertyType === t ? 'border-charcoal bg-white' : 'border-stone'}`}><input type="radio" value={t} className="mr-2" {...register('propertyType')} />{t}</label>)}</div>
          {errors.propertyType && <p role="alert" className="mt-2 text-xs text-red-700">{errors.propertyType.message}</p>}</fieldset></div>

        <div hidden={step !== 1} className="grid gap-5 sm:grid-cols-2"><h2 className="font-display text-3xl sm:col-span-2">Plot details</h2>
          <Field label="Plot width" error={errors.plotWidth?.message}><input className={input} type="number" step="any" {...register('plotWidth')} /></Field>
          <Field label="Plot length" error={errors.plotLength?.message}><input className={input} type="number" step="any" {...register('plotLength')} /></Field>
          <Field label="Unit"><select className={input} {...register('unit')}><option value="ft">Feet</option><option value="m">Meters</option></select></Field>
          <Field label="City or project location" error={errors.location?.message}><input className={input} {...register('location')} /></Field>
          <Field label="Road-facing direction (optional)"><select className={input} {...register('roadFacing')}>{sel(['North', 'South', 'East', 'West'])}</select></Field>
          <Field label="Plot sketch (optional)" hint="JPG, PNG, WebP or PDF, up to 5 MB."><input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(e) => setPlotFile(Array.from(e.target.files).slice(0, 1))} /></Field></div>

        <div hidden={step !== 2} className="grid gap-5 sm:grid-cols-2"><h2 className="font-display text-3xl sm:col-span-2">Building needs</h2>
          <Field label="Floors" error={errors.floors?.message}><input className={input} type="number" min="1" {...register('floors')} /></Field>
          <Field label="Bedrooms"><input className={input} type="number" min="0" {...register('bedrooms')} /></Field>
          <Field label="Bathrooms"><input className={input} type="number" min="0" {...register('bathrooms')} /></Field>
          <Field label="Kitchen"><select className={input} {...register('kitchen')}>{sel(['Open kitchen', 'Closed kitchen', 'Open with utility area'])}</select></Field>
          <Field label="Living and dining"><select className={input} {...register('living')}>{sel(['Combined living and dining', 'Separate living and dining'])}</select></Field>
          <Field label="Parking"><select className={input} {...register('parking')}>{sel(['None', 'Two-wheeler', '1 car', '2 or more cars'])}</select></Field>
          <fieldset className="sm:col-span-2"><legend className="text-sm font-medium">Extras</legend><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">{extras.map((x) => <label key={x} className="flex items-center gap-2 text-sm"><input type="checkbox" value={x} {...register('extras')} /> {x}</label>)}</div></fieldset></div>

        <div hidden={step !== 3} className="grid gap-5"><h2 className="font-display text-3xl">Style and services</h2>
          <Field label="Preferred style"><select className={input} {...register('style')}>{sel(styles)}</select></Field>
          <fieldset><legend className="text-sm font-medium">Services needed</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{svc.map(([k, l]) => <label key={k} className="flex items-center gap-2 text-sm"><input type="checkbox" value={k} {...register('services')} /> {l}</label>)}</div>{errors.services && <p role="alert" className="mt-1 text-xs text-red-700">{errors.services.message}</p>}</fieldset></div>

        <div hidden={step !== 4} className="grid gap-5"><h2 className="font-display text-3xl">Preferences</h2>
          <Field label="Budget range (optional)"><select className={input} {...register('budget')}>{sel(['Not sure yet', 'Under 5 lakh', '5 to 15 lakh', '15 to 50 lakh', 'Above 50 lakh'])}</select></Field>
          <Field label="Expected timeline (optional)"><select className={input} {...register('timeline')}>{sel(['Flexible', 'Within a month', '1 to 3 months', '3 to 6 months'])}</select></Field>
          <Field label="Additional requirements"><textarea rows={4} className={input} {...register('message')} /></Field>
          <Field label="Reference images (optional)" hint="Up to 2 files."><input type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(e) => setRefFiles(Array.from(e.target.files).slice(0, 2))} /></Field></div>

        <div hidden={step !== 5} className="grid gap-5 sm:grid-cols-2"><h2 className="font-display text-3xl sm:col-span-2">How can we reach you?</h2>
          <Field label="Name" error={errors.name?.message}><input className={input} autoComplete="name" {...register('name')} /></Field>
          <Field label="Phone" error={errors.phone?.message}><input className={input} type="tel" autoComplete="tel" {...register('phone')} /></Field>
          <Field label="Email (optional)" error={errors.email?.message}><input className={input} type="email" {...register('email')} /></Field>
          <Field label="Preferred contact"><select className={input} {...register('preferredContact')}><option>WhatsApp</option><option>Phone call</option><option>Email</option></select></Field>
          <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px]" {...register('website')} />
          <div className="sm:col-span-2"><label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" {...register('consent')} /><span>I agree to the <Link to="/privacy" className="underline">privacy notice</Link> and to being contacted.</span></label>{errors.consent && <p role="alert" className="mt-1 text-xs text-red-700">{errors.consent.message}</p>}</div></div>

        <div hidden={step !== last}><h2 className="font-display text-3xl">Review your answers</h2>
          <dl className="mt-5 border-t border-stone">{review.map(([k, val, s]) => <div key={k} className="flex items-start justify-between gap-4 border-b border-stone py-3 text-sm"><div><dt className="text-muted">{k}</dt><dd>{val}</dd></div>{s != null && <button type="button" onClick={() => setStep(s)} className="underline underline-offset-4">Edit</button>}</div>)}</dl></div>

        {error && <p role="alert" className="mt-6 border border-red-700 bg-white p-3 text-sm text-red-700">{error}</p>}
        <div className="mt-8 flex gap-3">
          {step > 0 && <button type="button" onClick={() => setStep(step - 1)} className="btn-outline">Back</button>}
          {step < last && <button type="button" onClick={next} className="btn-primary">{step === last - 1 ? 'Review' : 'Next'}</button>}
          {step === last && <button disabled={isSubmitting} className="btn-primary disabled:opacity-60">{isSubmitting ? 'Sending...' : 'Submit requirements'}</button>}
        </div>
      </form>
    </section>
  );
}
