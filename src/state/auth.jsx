/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { readJSON, remove, writeJSON } from './storage';
import { sleep } from './sleep';

const AUTH_KEY = 'auth';

const DEMO = {
  email: 'admin@complaintai.com',
  password: 'Admin123',
  user: { name: 'Demo Admin', role: 'Administrator', level: 'Level 5' },
};

const AuthContext = createContext(null);

function getSession() {
  const local = readJSON(localStorage, AUTH_KEY, null);
  if (local?.token) return { storage: localStorage, session: local };
  const session = readJSON(sessionStorage, AUTH_KEY, null);
  if (session?.token) return { storage: sessionStorage, session };
  return { storage: null, session: null };
}

export function AuthProvider({ children }) {
  const [{ user, token }, setState] = useState(() => {
    const { session } = getSession();
    return { user: session?.user ?? null, token: session?.token ?? null };
  });

  useEffect(() => {
    const onStorage = () => {
      const { session } = getSession();
      setState({ user: session?.user ?? null, token: session?.token ?? null });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = useCallback(async ({ email, password, remember }) => {
    await sleep(1100);
    const ok = email.trim().toLowerCase() === DEMO.email && password === DEMO.password;
    if (!ok) {
      const error = new Error('Invalid credentials');
      error.code = 'AUTH_INVALID';
      throw error;
    }

    const auth = {
      token: 'demo-token-' + Date.now().toString(16),
      user: DEMO.user,
      email: DEMO.email,
      issuedAt: Date.now(),
    };

    const storage = remember ? localStorage : sessionStorage;
    writeJSON(storage, AUTH_KEY, auth);
    if (remember) remove(sessionStorage, AUTH_KEY);
    else remove(localStorage, AUTH_KEY);

    setState({ user: auth.user, token: auth.token });
    return auth;
  }, []);

  const logout = useCallback(async () => {
    await sleep(450);
    remove(localStorage, AUTH_KEY);
    remove(sessionStorage, AUTH_KEY);
    setState({ user: null, token: null });
  }, []);

  const api = useMemo(
    () => ({
      demo: { email: DEMO.email, password: DEMO.password },
      isAuthed: Boolean(token),
      token,
      user,
      login,
      logout,
    }),
    [login, logout, token, user],
  );

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

