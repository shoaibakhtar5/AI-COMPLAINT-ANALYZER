import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { ThemeProvider } from './state/theme.jsx';
import { AuthProvider } from './state/auth.jsx';
import { SuperAdminAuthProvider } from './state/superAdminAuth.jsx';
import { ComplaintsProvider } from './state/complaints.jsx';
import { ToastProvider } from './state/toast.jsx';
import Toaster from './components/Toaster.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <SuperAdminAuthProvider>
              <ComplaintsProvider>
                <App />
                <Toaster />
              </ComplaintsProvider>
            </SuperAdminAuthProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
