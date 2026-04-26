import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/layouts/components/Sidebar';
import { Topbar } from '@/layouts/components/Topbar';

export function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-content farm-background">
        <Topbar />
        <Outlet />
      </main>
    </div>
  );
}
