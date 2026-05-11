import { readJSON, remove, writeJSON } from '../state/storage';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const AUTH_KEY = 'auth';

export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function getStoredSession() {
  const local = readJSON(localStorage, AUTH_KEY, null);
  if (local?.token) return { storage: localStorage, session: local };
  const session = readJSON(sessionStorage, AUTH_KEY, null);
  if (session?.token) return { storage: sessionStorage, session };
  return { storage: null, session: null };
}

export function getAccessToken() {
  return getStoredSession().session?.token ?? null;
}

export function storeSession(auth, remember = true) {
  const storage = remember ? localStorage : sessionStorage;
  writeJSON(storage, AUTH_KEY, auth);
  if (remember) remove(sessionStorage, AUTH_KEY);
  else remove(localStorage, AUTH_KEY);
}

export function clearSession() {
  remove(localStorage, AUTH_KEY);
  remove(sessionStorage, AUTH_KEY);
}

export function normalizeApiUser(user, company) {
  if (!user) return null;
  return {
    ...user,
    name: user.owner_name,
    role: user.role,
    level: user.role,
    company: company ?? user.organization_name,
  };
}

export async function apiFetch(path, options = {}) {
  const token = Object.prototype.hasOwnProperty.call(options, 'token') ? options.token : getAccessToken();
  const headers = new Headers(options.headers || {});
  const body = options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : undefined;

  headers.set('Accept', 'application/json');
  if (body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof data === 'object' ? data.detail || data.message : data;
    throw new ApiError(message || 'API request failed', { status: response.status, data });
  }

  return data;
}
