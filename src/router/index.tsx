import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { AppLayout } from '@/layouts/AppLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { AlertsPage } from '@/features/alerts/AlertsPage';
import { LocationsPage } from '@/features/locations/LocationsPage';
import { CowsPage } from '@/features/cows/CowsPage';
import { CollarsPage } from '@/features/collars/CollarsPage';
import { GeofencesPage } from '@/features/geofences/GeofencesPage';
import { ReportsPage } from '@/features/reports/ReportsPage';
import { UsersPage } from '@/features/users/UsersPage';

function ProtectedRoute() {
  const session = useAuthStore((state) => state.session);

  if (!session?.token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function GuestOnlyRoute() {
  const session = useAuthStore((state) => state.session);

  if (session?.token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

function RootRedirect() {
  const session = useAuthStore((state) => state.session);

  return session?.token ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/login',
    element: <GuestOnlyRoute />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/alerts', element: <AlertsPage /> },
          { path: '/locations', element: <LocationsPage /> },
          { path: '/cows', element: <CowsPage /> },
          { path: '/collars', element: <CollarsPage /> },
          { path: '/geofences', element: <GeofencesPage /> },
          { path: '/reports', element: <ReportsPage /> },
          { path: '/users', element: <UsersPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <RootRedirect />,
  },
]);