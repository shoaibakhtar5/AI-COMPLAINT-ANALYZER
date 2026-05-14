import { apiFetch } from './api';
import { readJSON, remove, writeJSON } from '../state/storage';

const SUPER_AUTH_KEY = 'super-admin-auth';

export function getStoredSuperAdminSession() {
  return readJSON(localStorage, SUPER_AUTH_KEY, null) ?? readJSON(sessionStorage, SUPER_AUTH_KEY, null);
}

export function getSuperAdminToken() {
  return getStoredSuperAdminSession()?.token ?? null;
}

export function storeSuperAdminSession(auth, remember = true) {
  const storage = remember ? localStorage : sessionStorage;
  writeJSON(storage, SUPER_AUTH_KEY, auth);
  if (remember) remove(sessionStorage, SUPER_AUTH_KEY);
  else remove(localStorage, SUPER_AUTH_KEY);
}

export function clearSuperAdminSession() {
  remove(localStorage, SUPER_AUTH_KEY);
  remove(sessionStorage, SUPER_AUTH_KEY);
}

export function normalizeSuperAdmin(admin) {
  if (!admin) return null;
  return {
    ...admin,
    name: admin.display_name,
    role: admin.role || 'super_admin',
  };
}

export function superAdminFetch(path, options = {}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return apiFetch(`/super-admin${normalizedPath}`, {
    ...options,
    token: Object.prototype.hasOwnProperty.call(options, 'token') ? options.token : getSuperAdminToken(),
  });
}

