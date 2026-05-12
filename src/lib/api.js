import { readJSON, remove, writeJSON } from '../state/storage';

const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const AUTH_KEY = 'auth';
const DEFAULT_TIMEOUT_MS = 20000;

function normalizeBaseUrl(value) {
  const trimmed = String(value || '').replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

export const API_BASE_URL = normalizeBaseUrl(RAW_API_URL);

export class ApiError extends Error {
  constructor(message, { status = 0, data = null, code = 'API_ERROR' } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.code = code;
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

function toApiUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

function errorMessage(data, fallback) {
  if (!data) return fallback;
  if (typeof data === 'string') return data || fallback;
  if (typeof data.detail === 'string') return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item) => {
        const field = Array.isArray(item.loc) ? item.loc.slice(1).join('.') : '';
        return field ? `${field}: ${item.msg}` : item.msg;
      })
      .join(' | ');
  }
  return data.message || fallback;
}

async function parseResponse(response) {
  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return response.json();
  return response.text();
}

async function refreshAccessToken() {
  const { session, storage } = getStoredSession();
  if (!session?.refreshToken || !storage) return null;

  const response = await rawFetch('/auth/refresh', {
    method: 'POST',
    token: null,
    skipRefresh: true,
    body: { refresh_token: session.refreshToken },
  });

  const next = {
    ...session,
    token: response.access_token,
    refreshToken: response.refresh_token ?? session.refreshToken,
    tokenType: response.token_type ?? session.tokenType,
  };
  storeSession(next, storage === localStorage);
  return next.token;
}

async function rawFetch(path, options = {}) {
  const {
    body: requestBody,
    headers: requestHeaders,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    token: explicitToken,
    skipRefresh = false,
    ...fetchOptions
  } = options;

  const hasExplicitToken = Object.prototype.hasOwnProperty.call(options, 'token');
  const token = hasExplicitToken ? explicitToken : getAccessToken();
  const canRefresh = !skipRefresh && !hasExplicitToken;
  const headers = new Headers(requestHeaders || {});
  const isFormData = requestBody instanceof FormData;
  const body = isFormData || requestBody == null ? requestBody : JSON.stringify(requestBody);

  headers.set('Accept', 'application/json');
  if (body && !isFormData) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(toApiUrl(path), {
      ...fetchOptions,
      headers,
      body,
      credentials: 'include',
      signal: controller.signal,
    });
  } catch (error) {
    const isAbort = error?.name === 'AbortError';
    throw new ApiError(
      isAbort ? 'The API request timed out. Check that the backend is running.' : 'Unable to reach the backend API. Check server status and CORS configuration.',
      { code: isAbort ? 'API_TIMEOUT' : 'NETWORK_ERROR' },
    );
  } finally {
    window.clearTimeout(timeout);
  }

  const data = await parseResponse(response);

  if (response.status === 401 && canRefresh) {
    try {
      const nextToken = await refreshAccessToken();
      if (nextToken) return rawFetch(path, { ...options, token: nextToken, skipRefresh: true });
    } catch {
      clearSession();
    }
  }

  if (!response.ok) {
    if (response.status === 401 && canRefresh) clearSession();
    throw new ApiError(errorMessage(data, 'API request failed'), {
      status: response.status,
      data,
      code: response.status === 401 ? 'AUTH_INVALID' : 'API_ERROR',
    });
  }

  return data;
}

export function apiFetch(path, options = {}) {
  return rawFetch(path, options);
}
