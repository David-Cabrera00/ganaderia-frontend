import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  Navigation,
  Radio,
  Users,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { APP_ROUTES } from '@/shared/constants/appRoutes';
import { ROLE_LABELS } from '@/shared/constants/roles';
import type { Role } from '@/types';
import { CattleIcon } from '@/shared/components/ui/CattleIcon';
import '@/components/layout/Sidebar.css';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  group: 'control' | 'field' | 'management';
  roles?: readonly Role[];
}

const NAV_ITEMS: NavItem[] = [
  { to: APP_ROUTES.dashboard, label: 'Dashboard', icon: <LayoutDashboard size={18} />, group: 'control' },
  { to: APP_ROUTES.alerts, label: 'Alertas', icon: <Bell size={18} />, group: 'control' },
  { to: APP_ROUTES.locations, label: 'Ubicaciones', icon: <Navigation size={18} />, group: 'control' },
  { to: APP_ROUTES.cows, label: 'Vacas', icon: <CattleIcon width={18} height={18} />, group: 'field', roles: ['ADMINISTRADOR', 'SUPERVISOR', 'OPERADOR'] },
  { to: APP_ROUTES.collars, label: 'Collares', icon: <Radio size={18} />, group: 'field' },
  { to: APP_ROUTES.geofences, label: 'Geocercas', icon: <MapPin size={18} />, group: 'field', roles: ['ADMINISTRADOR', 'SUPERVISOR'] },
  { to: APP_ROUTES.reports, label: 'Reportes', icon: <FileText size={18} />, group: 'management', roles: ['ADMINISTRADOR', 'SUPERVISOR'] },
  { to: APP_ROUTES.users, label: 'Usuarios', icon: <Users size={18} />, group: 'management', roles: ['ADMINISTRADOR'] },
];

const GROUP_LABELS: Record<NavItem['group'], string> = {
  control: 'Centro de control',
  field: 'Campo y activos',
  management: 'Administración',
};

export function Sidebar() {
  const { session, clearSession, hasAnyRole } = useAuthStore();
  const navigate = useNavigate();

  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || hasAnyRole([...item.roles]));
  const groups = Array.from(new Set(visibleItems.map((item) => item.group)));

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-badge">
          <CattleIcon width={22} height={22} className="sidebar-logo-icon" />
        </div>
        <div>
          <div className="sidebar-logo-title">Ganadería 4.0</div>
          <div className="sidebar-logo-sub">Monitoreo ganadero · Gestión operativa</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {groups.map((group) => (
          <div key={group} className="sidebar-group">
            <div className="sidebar-section-label">{GROUP_LABELS[group]}</div>
            <div className="sidebar-group-links">
              {visibleItems
                .filter((item) => item.group === group)
                .map((item) => (
                  <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <span className="sidebar-link-icon">{item.icon}</span>
                    <span className="sidebar-link-label">{item.label}</span>
                  </NavLink>
                ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{session?.name?.charAt(0).toUpperCase() ?? 'U'}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{session?.name ?? 'Usuario'}</div>
            <div className="sidebar-user-role">{session?.role ? ROLE_LABELS[session.role] : 'Sin sesión'}</div>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-icon sidebar-logout"
          onClick={() => {
            clearSession();
            navigate(APP_ROUTES.login, { replace: true });
          }}
          title="Cerrar sesión"
        >
          <LogOut size={17} />
        </button>
      </div>
    </aside>
  );
}
