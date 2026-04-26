import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { APP_ROUTES } from '@/shared/constants/appRoutes';

export function NotFoundPage() {
  return (
    <div className="page-body">
      <div className="card" style={{ maxWidth: 560, margin: '48px auto' }}>
        <div className="card-body empty-state">
          <AlertTriangle size={32} className="empty-state-icon" />
          <strong>Página no encontrada</strong>
          <span className="empty-state-text">
            La ruta que intentaste abrir no existe dentro del frontend local de Ganadería 4.0.
          </span>
          <Link to={APP_ROUTES.dashboard} className="btn btn-primary">
            Volver al dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
