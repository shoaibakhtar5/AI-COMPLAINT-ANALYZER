/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    ({ title, message, tone = 'info', durationMs = 3600 }) => {
      const id = uid();
      const toast = { id, title, message, tone };
      setToasts((prev) => [toast, ...prev].slice(0, 4));
      if (durationMs > 0) {
        const timer = setTimeout(() => dismiss(id), durationMs);
        timers.current.set(id, timer);
      }
      return id;
    },
    [dismiss],
  );

  const api = useMemo(
    () => ({
      toasts,
      dismiss,
      push,
      success: (title, message, opts) => push({ title, message, tone: 'success', ...opts }),
      error: (title, message, opts) => push({ title, message, tone: 'error', ...opts }),
      info: (title, message, opts) => push({ title, message, tone: 'info', ...opts }),
    }),
    [dismiss, push, toasts],
  );

  return <ToastContext.Provider value={api}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

