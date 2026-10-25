import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Field, { input } from '../components/Field';

export default function Login() {
  const { user, login } = useAuth();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/admin" replace />;
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { await login(f.email, f.password); } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  return (
    <main className="mx-auto max-w-sm px-5 py-24">
      <h1 className="font-display text-4xl">Admin sign in</h1>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <Field label="Email"><input className={input} type="email" autoComplete="username" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></Field>
        <Field label="Password"><input className={input} type="password" autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required /></Field>
        {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
        <button disabled={busy} className="btn-primary w-full disabled:opacity-60">{busy ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </main>
  );
}
