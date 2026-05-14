import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../state/auth';
import { useSuperAdminAuth } from '../state/superAdminAuth';
import { useToast } from '../state/toast';

export default function RequireAuth({ children }) {
  const { isAuthed, isLoggedOut } = useAuth();
  const superAuth = useSuperAdminAuth();
  const toast = useToast();
  const location = useLocation();
  const from = `${location.pathname}${location.search}${location.hash}`;

  useEffect(() => {
    if (isAuthed || isLoggedOut) return;

    const toastKey = `auth-redirect:${from}`;
    if (sessionStorage.getItem(toastKey)) return;

    sessionStorage.setItem(toastKey, 'shown');
    toast.info('Enterprise workspace locked', 'Please login to access the enterprise workspace.', { durationMs: 3200 });

    window.setTimeout(() => {
      sessionStorage.removeItem(toastKey);
    }, 3200);
  }, [from, isAuthed, isLoggedOut, toast]);

  if (superAuth.isAuthed) {
    return <Navigate to="/super-admin/dashboard" replace />;
  }

  if (!isAuthed) {
    if (isLoggedOut) {
      return <Navigate to="/" replace state={{ loggedOut: true }} />;
    }

    return <Navigate to="/admin/login" replace state={{ from, protectedRedirect: true }} />;
  }
  return children;
}
