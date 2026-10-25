import { useSeo } from '../lib/seo';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Breadcrumbs from '../components/Breadcrumbs';
import Field, { input } from '../components/Field';
import { submitInquiry } from '../lib/api';
import { site, whatsappLink } from '../config/site';

export default function Contact() {
  useSeo('Contact', 'Contact by phone, WhatsApp or email to discuss your house or building design.');
  const [ref, setRef] = useState(null);
  const [error, setError] = useState('');
  const { register, handleSubmit, setError: setFieldError, formState: { errors, isSubmitting } } = useForm({ defaultValues: { consent: false, website: '' } });
  const wa = whatsappLink();

  const onSubmit = async (v) => {
    setError('');
    if (!v.consent) return setFieldError('consent', { message: 'Please accept the privacy notice' });
    try { setRef((await submitInquiry({ ...v, source: 'contact' })).reference); }
    catch (e) { setError(e.message); Object.entries(e.fields || {}).forEach(([k, m]) => setFieldError(k, { message: m })); }
  };

  return (
    <section className="container-x py-16">
      <Breadcrumbs trail={[['Contact']]} />
      <h1 className="mt-6 font-display text-5xl md:text-6xl">Contact</h1>
      <div className="mt-10 grid gap-12 md:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3 text-muted">
          <p>{site.name}, {site.title}</p>
          {site.phone && <p><a className="underline" href={`tel:${site.phone}`}>{site.phone}</a></p>}
          {site.email && <p><a className="underline" href={`mailto:${site.email}`}>{site.email}</a></p>}
          {wa && <p><a className="underline" href={wa} target="_blank" rel="noopener noreferrer">Message on WhatsApp</a></p>}
          <p className="pt-4 text-sm">Planning a project? <Link to="/request-quote" className="underline">Request a quote</Link> with your plot details.</p>
        </div>
        {ref ? (
          <div><h2 className="font-display text-3xl">Message received</h2><p className="mt-3 text-muted">Reference: <span className="font-medium text-charcoal">{ref}</span></p></div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <Field label="Name" error={errors.name?.message}><input className={input} {...register('name', { required: 'Enter your name' })} /></Field>
            <Field label="Phone" error={errors.phone?.message}><input className={input} type="tel" {...register('phone', { required: 'Enter your phone number' })} /></Field>
            <Field label="Message" error={errors.message?.message}><textarea rows={4} className={input} {...register('message', { required: 'Write a short message' })} /></Field>
            <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px]" {...register('website')} />
            <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" {...register('consent')} /> <span>I agree to the <Link to="/privacy" className="underline">privacy notice</Link>.</span></label>
            {errors.consent && <p role="alert" className="text-xs text-red-700">{errors.consent.message}</p>}
            {error && <p role="alert" className="border border-red-700 bg-white p-3 text-sm text-red-700">{error}</p>}
            <button disabled={isSubmitting} className="btn-primary disabled:opacity-60">{isSubmitting ? 'Sending...' : 'Send message'}</button>
          </form>
        )}
      </div>
    </section>
  );
}
