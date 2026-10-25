import { createContext, useContext, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { api } from '../lib/adminApi';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export default function AdminRoot() {
  const [user, setUser] = useState(undefined); // undefined = still checking
  useEffect(() => {
    api('/auth/me').then(setUser).catch(() => setUser(null));
    const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex, nofollow';
    document.head.appendChild(m);
    return () => m.remove();
  }, []);
  const login = async (email, password) => setUser(await api('/auth/login', { method: 'POST', body: { email, password } }));
  const logout = async () => { await api('/auth/logout', { method: 'POST' }).catch(() => {}); setUser(null); };
  return <Ctx.Provider value={{ user, login, logout }}><Outlet /></Ctx.Provider>;
}
