const PREFIX = 'aegis:';

export function readJSON(storage, key, fallback) {
  try {
    const raw = storage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJSON(storage, key, value) {
  storage.setItem(PREFIX + key, JSON.stringify(value));
}

export function remove(storage, key) {
  storage.removeItem(PREFIX + key);
}

