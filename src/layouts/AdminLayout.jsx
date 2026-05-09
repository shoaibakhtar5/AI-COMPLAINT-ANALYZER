import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BackButton from '../components/BackButton';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const showBack = location.pathname !== '/admin/dashboard';

  return (
    <div className="min-h-screen bg-app text-white">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <Navbar onMenu={() => setOpen(true)} />
      <main className="min-h-screen px-4 pb-10 pt-24 lg:ml-72 lg:px-8">
        {showBack ? (
          <div className="mb-5">
            <BackButton fallback="/admin/dashboard" />
          </div>
        ) : null}
        <Outlet />
      </main>
    </div>
  );
}
