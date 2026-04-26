import { Link } from 'react-router-dom';
import { APP_ROUTES } from '@/shared/constants/appRoutes';

const QUICK_LINKS = [
  {
    title: 'Gestionar vacas',
    description: 'Revisa estado, observaciones y token del hato.',
    to: APP_ROUTES.cows,
  },
  {
    title: 'Supervisar collares',
    description: 'Valida batería, firmware y señal de los dispositivos.',
    to: APP_ROUTES.collars,
  },
  {
    title: 'Ver geocercas',
    description: 'Confirma radios, áreas activas y asignaciones.',
    to: APP_ROUTES.geofences,
  },
  {
    title: 'Atender alertas',
    description: 'Resuelve incidentes abiertos y registra seguimiento.',
    to: APP_ROUTES.alerts,
  },
];

export function DashboardQuickLinks() {
  return (
    <section className="card">
      <div className="card-header">
        <span className="card-title">Accesos rápidos operativos</span>
      </div>
      <div className="card-body dashboard-quick-links">
        {QUICK_LINKS.map((link) => (
          <Link key={link.to} to={link.to} className="dashboard-quick-link">
            <strong>{link.title}</strong>
            <span>{link.description}</span>
            <small>Ir al módulo →</small>
          </Link>
        ))}
      </div>
    </section>
  );
}
