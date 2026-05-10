import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/auth';
import { useToast } from '../state/toast';

export default function useSecureLogout() {
  const auth = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  return useCallback(async ({ redirectTo = '/' } = {}) => {
    toast.info('Signing out', 'Clearing secure session...', { durationMs: 1600 });
    await auth.logout();
    navigate(redirectTo, { replace: true, state: { loggedOut: true } });
    toast.success('Logged out', 'Session cleared. Protected workspace history is locked.', { durationMs: 2600 });
  }, [auth, navigate, toast]);
}
