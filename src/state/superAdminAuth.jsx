/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearSuperAdminSession,
  getStoredSuperAdminSession,
  normalizeSuperAdmin,
  storeSuperAdminSession,
  superAdminFetch,
} from '../lib/superAdminApi';
import { sleep } from './sleep';

function buildAuth(payload) {
  return {
    token: payload.access_token,
    refreshToken: payload.refresh_token,
    tokenType: payload.token_type,
    admin: normalizeSuperAdmin(payload.admin),
    issuedAt: Date.now(),
  };
}

const SuperAdminAuthContext = createContext(null);

export function SuperAdminAuthProvider({ children }) {
  const [{ admin, token }, setState] = useState(() => {
    const session = getStoredSuperAdminSession();
    return { admin: session?.admin ?? null, token: session?.token ?? null };
  });

  const syncFromStorage = useCallback(() => {
    const session = getStoredSuperAdminSession();
    setState({ admin: session?.admin ?? null, token: session?.token ?? null });
  }, []);

  useEffect(() => {
    const onStorage = () => syncFromStorage();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [syncFromStorage]);

  useEffect(() => {
    if (!token) return;
    superAdminFetch('/me')
      .then((profile) => {
        const session = getStoredSuperAdminSession();
        if (!session) return;
        const next = { ...session, admin: normalizeSuperAdmin(profile) };
        storeSuperAdminSession(next, localStorage.getItem('super-admin-auth') != null);
        setState((current) => ({ ...current, admin: next.admin }));
      })
      .catch((error) => {
        if (error?.status === 401 || error?.status === 403) {
          clearSuperAdminSession();
          setState({ admin: null, token: null });
        }
      });
  }, [token]);

  const login = useCallback(async ({ usernameOrEmail, password, remember }) => {
    await sleep(250);
    const payload = await superAdminFetch('/login', {
      method: 'POST',
      token: null,
      body: {
        username_or_email: usernameOrEmail,
        password,
        remember: Boolean(remember),
      },
    });
    const auth = buildAuth(payload);
    storeSuperAdminSession(auth, Boolean(remember));
    setState({ admin: auth.admin, token: auth.token });
    return auth;
  }, []);

  const logout = useCallback(async () => {
    clearSuperAdminSession();
    setState({ admin: null, token: null });
    await sleep(120);
  }, []);

  const refreshAdmin = useCallback(async () => {
    const profile = await superAdminFetch('/me');
    const nextAdmin = normalizeSuperAdmin(profile);
    const session = getStoredSuperAdminSession();
    if (session) {
      storeSuperAdminSession({ ...session, admin: nextAdmin }, localStorage.getItem('super-admin-auth') != null);
    }
    setState((current) => ({ ...current, admin: nextAdmin }));
    return nextAdmin;
  }, []);

  const api = useMemo(() => ({
    admin,
    token,
    isAuthed: Boolean(token),
    login,
    logout,
    refreshAdmin,
  }), [admin, login, logout, refreshAdmin, token]);

  return <SuperAdminAuthContext.Provider value={api}>{children}</SuperAdminAuthContext.Provider>;
}

export function useSuperAdminAuth() {
  const ctx = useContext(SuperAdminAuthContext);
  if (!ctx) throw new Error('useSuperAdminAuth must be used within SuperAdminAuthProvider');
  return ctx;
}

