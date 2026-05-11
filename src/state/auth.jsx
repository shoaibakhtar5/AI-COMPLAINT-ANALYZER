/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch, clearSession, getStoredSession, normalizeApiUser, storeSession } from '../lib/api';
import { readJSON, remove, writeJSON } from './storage';
import { sleep } from './sleep';

const SIGNUP_DRAFT_KEY = 'signup-draft';
const LOGOUT_KEY = 'logout';

const DEMO = {
  email: 'admin@sentra.ai',
  username: 'admin@sentra.ai',
  password: 'Admin123',
  secretKey: 'NEXUS-SECURE-2026',
  company: 'Nexus Bank Enterprise',
};

function buildAuth(payload) {
  return {
    token: payload.access_token,
    refreshToken: payload.refresh_token,
    tokenType: payload.token_type,
    user: normalizeApiUser(payload.user, payload.company),
    email: payload.user?.email,
    company: payload.company,
    issuedAt: Date.now(),
  };
}

function normalizeApiError(error) {
  const message = String(error?.message || 'Authentication failed');
  if (message.toLowerCase().includes('secret')) error.code = 'SECRET_KEY_INVALID';
  if (message.toLowerCase().includes('password')) error.code = 'PASSWORD_INVALID';
  if (message.toLowerCase().includes('workspace')) error.code = 'WORKSPACE_NOT_FOUND';
  return error;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [{ user, token, logoutAt }, setState] = useState(() => {
    const { session } = getStoredSession();
    const logoutMarker = readJSON(sessionStorage, LOGOUT_KEY, null);
    return { user: session?.user ?? null, token: session?.token ?? null, logoutAt: logoutMarker?.endedAt ?? null };
  });

  const syncFromStorage = useCallback(() => {
    const { session } = getStoredSession();
    const logoutMarker = readJSON(sessionStorage, LOGOUT_KEY, null);
    setState({ user: session?.user ?? null, token: session?.token ?? null, logoutAt: logoutMarker?.endedAt ?? null });
  }, []);

  useEffect(() => {
    const onStorage = () => syncFromStorage();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [syncFromStorage]);

  useEffect(() => {
    if (!token) return;
    apiFetch('/auth/me')
      .then((profile) => {
        const { session, storage } = getStoredSession();
        if (!session || !storage) return;
        const next = { ...session, user: normalizeApiUser(profile, profile.organization_name), company: profile.organization_name };
        storeSession(next, storage === localStorage);
        setState((current) => ({ ...current, user: next.user }));
      })
      .catch(() => {
        clearSession();
        setState({ user: null, token: null, logoutAt: Date.now() });
      });
  }, [token]);

  const login = useCallback(async ({ usernameOrEmail, email, password, secretKey, remember }) => {
    await sleep(350);
    try {
      const payload = await apiFetch('/auth/login', {
        method: 'POST',
        body: {
          username_or_email: usernameOrEmail ?? email,
          password,
          secret_key: secretKey,
          remember: Boolean(remember),
        },
        token: null,
      });
      const auth = buildAuth(payload);
      storeSession(auth, Boolean(remember));
      remove(sessionStorage, LOGOUT_KEY);
      setState({ user: auth.user, token: auth.token, logoutAt: null });
      return auth;
    } catch (error) {
      throw normalizeApiError(error);
    }
  }, []);

  const saveSignupDraft = useCallback(async ({ ownerName, companyName, businessEmail, password }) => {
    await sleep(250);
    const draft = {
      ownerName: ownerName.trim(),
      companyName: companyName.trim(),
      businessEmail: businessEmail.trim().toLowerCase(),
      password,
      createdAt: Date.now(),
    };
    writeJSON(sessionStorage, SIGNUP_DRAFT_KEY, draft);
    return draft;
  }, []);

  const getSignupDraft = useCallback(() => readJSON(sessionStorage, SIGNUP_DRAFT_KEY, null), []);

  const initializeWorkspace = useCallback(
    async ({ companyName, ownerName, businessEmail, industry, volume, secretKey, position }) => {
      await sleep(450);
      const draft = getSignupDraft();
      if (!draft?.password) {
        const error = new Error('Signup session expired. Please create the workspace again.');
        error.code = 'SIGNUP_DRAFT_EXPIRED';
        throw error;
      }

      const payload = await apiFetch('/auth/signup', {
        method: 'POST',
        token: null,
        body: {
          owner_name: ownerName.trim(),
          company_name: companyName.trim(),
          business_email: businessEmail.trim().toLowerCase(),
          password: draft.password,
          industry,
          monthly_volume: volume,
          secret_key: secretKey.trim().toUpperCase(),
          role: position?.trim() || 'Workspace Owner',
        },
      });
      const auth = buildAuth(payload);
      storeSession(auth, true);
      remove(sessionStorage, SIGNUP_DRAFT_KEY);
      remove(sessionStorage, LOGOUT_KEY);
      setState({ user: auth.user, token: auth.token, logoutAt: null });
      return payload;
    },
    [getSignupDraft],
  );

  const logout = useCallback(async () => {
    const endedAt = Date.now();
    try {
      if (token) await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      // Local session clearing is the source of truth for browser access.
    }
    clearSession();
    writeJSON(sessionStorage, LOGOUT_KEY, { endedAt });
    setState({ user: null, token: null, logoutAt: endedAt });
    await sleep(160);
    return endedAt;
  }, [token]);

  const api = useMemo(
    () => ({
      demo: DEMO,
      isAuthed: Boolean(token),
      isLoggedOut: Boolean(logoutAt && !token),
      logoutAt,
      token,
      user,
      login,
      logout,
      saveSignupDraft,
      getSignupDraft,
      initializeWorkspace,
    }),
    [getSignupDraft, initializeWorkspace, login, logout, logoutAt, saveSignupDraft, token, user],
  );

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
