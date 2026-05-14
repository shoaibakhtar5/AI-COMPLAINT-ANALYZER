import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useSuperAdminAuth } from '../state/superAdminAuth';
import { useToast } from '../state/toast';

export default function RequireSuperAdmin({ children }) {
  const { isAuthed } = useSuperAdminAuth();
  const toast = useToast();
  const location = useLocation();
  const from = `${location.pathname}${location.search}${location.hash}`;

  useEffect(() => {
    if (isAuthed) return;
    const toastKey = `super-admin-redirect:${from}`;
    if (sessionStorage.getItem(toastKey)) return;
    sessionStorage.setItem(toastKey, 'shown');
    toast.info('Platform admin locked', 'Please login as a super admin to continue.', { durationMs: 2800 });
    window.setTimeout(() => sessionStorage.removeItem(toastKey), 3000);
  }, [from, isAuthed, toast]);

  if (!isAuthed) {
    return <Navigate to="/super-admin/login" replace state={{ from }} />;
  }

  return children;
}

