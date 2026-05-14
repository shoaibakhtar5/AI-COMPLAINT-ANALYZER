import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import AdminLayout from './layouts/AdminLayout';
import PublicLayout from './layouts/PublicLayout';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import AdminLogin from './pages/AdminLogin';
import AILab from './pages/AILab';
import Analytics from './pages/Analytics';
import BulkUpload from './pages/BulkUpload';
import Complaints from './pages/Complaints';
import Dashboard from './pages/Dashboard';
import Integrations from './pages/Integrations';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
import Onboarding from './pages/Onboarding';
import Settings from './pages/Settings';
import Signup from './pages/Signup';
import SubmitComplaint from './pages/SubmitComplaint';
import TrackComplaint from './pages/TrackComplaint';
import RequireAuth from './components/RequireAuth';
import RequireSuperAdmin from './components/RequireSuperAdmin';
import SplashScreen from './components/SplashScreen';
import SuperAdminAnalytics from './pages/super-admin/SuperAdminAnalytics';
import SuperAdminCompanies from './pages/super-admin/SuperAdminCompanies';
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';
import SuperAdminLogin from './pages/super-admin/SuperAdminLogin';
import SuperAdminSettings from './pages/super-admin/SuperAdminSettings';
import SuperAdminUsers from './pages/super-admin/SuperAdminUsers';

const MotionDiv = motion.div;

export default function App() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <>
      <SplashScreen />
      <AnimatePresence mode="wait">
        <MotionDiv
          key={location.pathname}
          initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.995 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.995 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        >
          <Routes location={location}>
            <Route element={<PublicLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="/submit" element={<SubmitComplaint />} />
              <Route path="/track" element={<TrackComplaint />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/signup" element={<Signup />} />
            </Route>

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/super-admin/login" element={<SuperAdminLogin />} />

            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="complaints" element={<Complaints />} />
              <Route path="bulk-upload" element={<BulkUpload />} />
              <Route path="integrations" element={<Integrations />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="ai-lab" element={<AILab />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route
              path="/super-admin"
              element={
                <RequireSuperAdmin>
                  <SuperAdminLayout />
                </RequireSuperAdmin>
              }
            >
              <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
              <Route path="dashboard" element={<SuperAdminDashboard />} />
              <Route path="companies" element={<SuperAdminCompanies />} />
              <Route path="users" element={<SuperAdminUsers />} />
              <Route path="analytics" element={<SuperAdminAnalytics />} />
              <Route path="settings" element={<SuperAdminSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </MotionDiv>
      </AnimatePresence>
    </>
  );
}
