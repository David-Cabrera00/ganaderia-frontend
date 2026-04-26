import { Moon, ShieldCheck, Sun, Waypoints } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getRoleLabel } from '@/shared/utils/roleUtils';
import { useTheme } from '@/shared/providers/ThemeProvider';

export function Topbar() {
  const { session } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="app-topbar">
      <div className="app-topbar-chip">
        <ShieldCheck size={14} />
        Operación supervisada
      </div>
      <div className="app-topbar-chip app-topbar-chip-muted">
        <Waypoints size={14} />
        Trazabilidad del hato
      </div>
      <div className="app-topbar-spacer" />
      <button
        type="button"
        className="app-topbar-theme-toggle"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
        title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        <span>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
      </button>
      <div className="app-topbar-user">
        <ShieldCheck size={14} />
        <span>{session?.name ?? 'Usuario'}</span>
        <span className="app-topbar-user-role">{session?.role ? getRoleLabel(session.role) : 'Sin rol'}</span>
      </div>
    </header>
  );
}
