import { useEffect, useState, useCallback } from 'react';
import { Bell, CheckCircle, XCircle, X, AlertCircle } from 'lucide-react';
import { AlertService } from '@/api/services';
import { AppError } from '@/api/httpClient';
import { useAuthStore } from '@/stores/authStore';
import {
  ALERT_TYPE_LABELS,
  ALERT_STATUS_COLORS,
  ALERT_STATUS_LABELS,
  formatDateTime,
} from '@/utils/helpers';
import type { AlertResponse, AlertStatus, AlertType } from '@/types';
import { PageContainer } from '@/layouts/components/PageContainer';
import { PageHeader } from '@/layouts/components/PageHeader';
import { MetricCard } from '@/shared/components/ui/MetricCard';
import toast from 'react-hot-toast';

export function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<AlertStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<AlertType | ''>('');
  const [resolveModal, setResolveModal] = useState<{ alert: AlertResponse; action: 'resolve' | 'discard' } | null>(null);
  const [observations, setObservations] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { hasAnyRole } = useAuthStore();
  const canManage = hasAnyRole(['ADMINISTRADOR']);
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await AlertService.getPage({
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        page,
        size: PAGE_SIZE,
      });
      setAlerts(response.content);
      setTotal(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (err) {
      toast.error(AppError.from(err).serverMessage);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAction = async () => {
    if (!resolveModal) return;
    setSubmitting(true);
    try {
      if (resolveModal.action === 'resolve') {
        await AlertService.resolve(resolveModal.alert.id, observations || undefined);
        toast.success('Alerta resuelta');
      } else {
        await AlertService.discard(resolveModal.alert.id, observations || undefined);
        toast.success('Alerta descartada');
      }
      setResolveModal(null);
      setObservations('');
      void load();
    } catch (err) {
      toast.error(AppError.from(err).serverMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = alerts.filter((alert) => alert.status === 'PENDIENTE').length;
  const resolvedCount = alerts.filter((alert) => alert.status === 'RESUELTA').length;
  const discardedCount = alerts.filter((alert) => alert.status === 'DESCARTADA').length;

  return (
    <>
      <PageHeader
        eyebrow="Eventos priorizados"
        title="Alertas"
        badge="Panel de seguimiento"
        subtitle="Filtra incidentes por tipo y estado para revisar qué necesita atención inmediata dentro del flujo local."
      />

      <PageContainer>
        <section className="overview-grid">
          <MetricCard icon={<Bell size={20} />} label="Registros en página" value={alerts.length} helper="Alertas visibles con los filtros actuales" tone="info" />
          <MetricCard icon={<AlertCircle size={20} />} label="Pendientes" value={pendingCount} helper="Eventos por resolver en este corte" tone={pendingCount > 0 ? 'danger' : 'success'} />
          <MetricCard icon={<CheckCircle size={20} />} label="Resueltas" value={resolvedCount} helper="Casos cerrados en la página actual" tone="success" />
          <MetricCard icon={<XCircle size={20} />} label="Descartadas" value={discardedCount} helper="Eventos cerrados sin acción" tone="warning" />
        </section>

        <div className="toolbar toolbar-panel">
          <div className="toolbar-left">
            <select
              className="form-select"
              style={{ width: 180 }}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as AlertStatus | ''); setPage(0); }}
            >
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="RESUELTA">Resuelta</option>
              <option value="DESCARTADA">Descartada</option>
            </select>
            <select
              className="form-select"
              style={{ width: 220 }}
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value as AlertType | ''); setPage(0); }}
            >
              <option value="">Todos los tipos</option>
              <option value="EXIT_GEOFENCE">Salida de geocerca</option>
              <option value="COLLAR_OFFLINE">Collar sin señal</option>
            </select>
          </div>
          <span className="page-summary-note">{total} alertas acumuladas en el entorno local</span>
        </div>

        {loading ? (
          <div className="loading-center"><div className="loading-spinner" /></div>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tipo</th>
                    <th>Mensaje</th>
                    <th>Vaca</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Observaciones</th>
                    {canManage ? <th style={{ width: 100 }}>Acciones</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {alerts.length === 0 ? (
                    <tr>
                      <td colSpan={canManage ? 8 : 7}>
                        <div className="empty-state">
                          <Bell size={32} className="empty-state-icon" />
                          <span className="empty-state-text">No se encontraron alertas para los filtros seleccionados</span>
                        </div>
                      </td>
                    </tr>
                  ) : alerts.map((alert) => (
                    <tr key={alert.id}>
                      <td className="td-mono">#{alert.id}</td>
                      <td>{ALERT_TYPE_LABELS[alert.type]}</td>
                      <td style={{ maxWidth: 280 }}>{alert.message}</td>
                      <td>{alert.cowName ?? 'Sin vaca asociada'}</td>
                      <td>
                        <span className={`badge ${ALERT_STATUS_COLORS[alert.status]}`}>
                          {ALERT_STATUS_LABELS[alert.status]}
                        </span>
                      </td>
                      <td className="td-mono">{formatDateTime(alert.createdAt)}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{alert.observations ?? '—'}</td>
                      {canManage ? (
                        <td>
                          {alert.status === 'PENDIENTE' ? (
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button className="btn btn-success btn-icon btn-sm" onClick={() => { setResolveModal({ alert, action: 'resolve' }); setObservations(''); }} title="Resolver"><CheckCircle size={13} /></button>
                              <button className="btn btn-danger btn-icon btn-sm" onClick={() => { setResolveModal({ alert, action: 'discard' }); setObservations(''); }} title="Descartar"><XCircle size={13} /></button>
                            </div>
                          ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Sin acciones</span>}
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Pág. {page + 1} de {totalPages}
                </span>
                <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>← Anterior</button>
                <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage((current) => current + 1)}>Siguiente →</button>
              </div>
            ) : null}
          </>
        )}
      </PageContainer>

      {resolveModal ? (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setResolveModal(null); }}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{resolveModal.action === 'resolve' ? 'Resolver alerta' : 'Descartar alerta'}</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setResolveModal(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', marginBottom: 14 }}>
                {resolveModal.alert.message}
              </p>
              <div className="form-group">
                <label className="form-label">Observaciones</label>
                <textarea className="form-textarea" placeholder="Opcional: agrega una nota para el historial..." value={observations} onChange={(e) => setObservations(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setResolveModal(null)}>Cancelar</button>
              <button type="button" className={`btn ${resolveModal.action === 'resolve' ? 'btn-success' : 'btn-danger'}`} onClick={() => void handleAction()} disabled={submitting}>
                {submitting ? <><span className="loading-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Procesando...</> : resolveModal.action === 'resolve' ? 'Resolver alerta' : 'Descartar alerta'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
