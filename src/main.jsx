import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { ThemeProvider } from './state/theme.jsx';
import { AuthProvider } from './state/auth.jsx';
import { ComplaintsProvider } from './state/complaints.jsx';
import { ToastProvider } from './state/toast.jsx';
import Toaster from './components/Toaster.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <ComplaintsProvider>
              <App />
              <Toaster />
            </ComplaintsProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
