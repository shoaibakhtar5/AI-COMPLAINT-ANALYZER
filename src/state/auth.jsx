/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { readJSON, remove, writeJSON } from './storage';
import { sleep } from './sleep';

const AUTH_KEY = 'auth';
const WORKSPACE_KEY = 'workspace';
const SIGNUP_DRAFT_KEY = 'signup-draft';

const DEMO = {
  email: 'admin@sentra.ai',
  username: 'demo-admin',
  password: 'Admin123',
  secretKey: 'NEXUS-SECURE-2026',
  company: 'Nexus Bank',
  user: { name: 'Demo Admin', role: 'Operations Admin', level: 'Workspace Owner' },
};

const defaultWorkspace = {
  companyName: DEMO.company,
  ownerName: DEMO.user.name,
  businessEmail: DEMO.email,
  industry: 'Financial Services',
  volume: '1,000 - 5,000 complaints / month',
  secretKey: DEMO.secretKey,
  user: DEMO.user,
  password: DEMO.password,
  username: DEMO.username,
};

const normalize = (value) => String(value ?? '').trim().toLowerCase();
const normalizeKey = (value) => String(value ?? '').trim().toUpperCase();

function getSession() {
  const local = readJSON(localStorage, AUTH_KEY, null);
  if (local?.token) return { storage: localStorage, session: local };
  const session = readJSON(sessionStorage, AUTH_KEY, null);
  if (session?.token) return { storage: sessionStorage, session };
  return { storage: null, session: null };
}

function readWorkspace() {
  return readJSON(localStorage, WORKSPACE_KEY, null);
}

function buildSession(workspace, remember) {
  const auth = {
    token: 'demo-token-' + Date.now().toString(16),
    user: workspace.user,
    email: workspace.businessEmail,
    company: workspace.companyName,
    issuedAt: Date.now(),
  };

  const storage = remember ? localStorage : sessionStorage;
  writeJSON(storage, AUTH_KEY, auth);
  if (remember) remove(sessionStorage, AUTH_KEY);
  else remove(localStorage, AUTH_KEY);

  return auth;
}

function matchesWorkspace(workspace, { usernameOrEmail, password, secretKey }) {
  const loginId = normalize(usernameOrEmail);
  const allowedLogin = loginId === normalize(workspace.businessEmail) || loginId === normalize(workspace.username);

  if (!allowedLogin) {
    const error = new Error('Workspace not found');
    error.code = 'WORKSPACE_NOT_FOUND';
    throw error;
  }

  if (password !== workspace.password) {
    const error = new Error('Incorrect password');
    error.code = 'PASSWORD_INVALID';
    throw error;
  }

  if (normalizeKey(secretKey) !== normalizeKey(workspace.secretKey)) {
    const error = new Error('Invalid secret key');
    error.code = 'SECRET_KEY_INVALID';
    throw error;
  }

  return true;
}

const AuthContext = createContext(null);

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

  const login = useCallback(async ({ usernameOrEmail, email, password, secretKey, remember }) => {
    await sleep(950);
    const loginId = usernameOrEmail ?? email;
    const savedWorkspace = readWorkspace();
    const workspaces = [savedWorkspace, defaultWorkspace].filter(Boolean);
    const workspace = workspaces.find((item) => {
      const normalized = normalize(loginId);
      return normalized === normalize(item.businessEmail) || normalized === normalize(item.username);
    });

    if (!workspace) {
      const error = new Error('Workspace not found');
      error.code = 'WORKSPACE_NOT_FOUND';
      throw error;
    }

    matchesWorkspace(workspace, { usernameOrEmail: loginId, password, secretKey });

    const auth = buildSession(workspace, remember);
    setState({ user: auth.user, token: auth.token });
    return auth;
  }, []);

  const saveSignupDraft = useCallback(async ({ ownerName, companyName, businessEmail, password }) => {
    await sleep(700);
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

  const initializeWorkspace = useCallback(async ({ companyName, ownerName, businessEmail, industry, volume, secretKey, position, logoName }) => {
    await sleep(1350);
    const workspace = {
      companyName: companyName.trim(),
      ownerName: ownerName.trim(),
      businessEmail: businessEmail.trim().toLowerCase(),
      industry,
      volume,
      secretKey: normalizeKey(secretKey),
      position: position?.trim() || 'Workspace Owner',
      logoName: logoName || '',
      password: getSignupDraft()?.password ?? DEMO.password,
      username: businessEmail.trim().toLowerCase(),
      user: {
        name: ownerName.trim(),
        role: position?.trim() || 'Workspace Owner',
        level: 'Workspace Owner',
      },
      createdAt: Date.now(),
    };

    writeJSON(localStorage, WORKSPACE_KEY, workspace);
    remove(sessionStorage, SIGNUP_DRAFT_KEY);
    const auth = buildSession(workspace, true);
    setState({ user: auth.user, token: auth.token });
    return workspace;
  }, [getSignupDraft]);

  const logout = useCallback(async () => {
    await sleep(450);
    remove(localStorage, AUTH_KEY);
    remove(sessionStorage, AUTH_KEY);
    setState({ user: null, token: null });
  }, []);

  const api = useMemo(
    () => ({
      demo: {
        email: DEMO.email,
        username: DEMO.username,
        password: DEMO.password,
        secretKey: DEMO.secretKey,
        company: DEMO.company,
      },
      isAuthed: Boolean(token),
      token,
      user,
      login,
      logout,
      saveSignupDraft,
      getSignupDraft,
      initializeWorkspace,
    }),
    [getSignupDraft, initializeWorkspace, login, logout, saveSignupDraft, token, user],
  );

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
