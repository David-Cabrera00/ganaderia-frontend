import { useEffect, useState, useCallback } from 'react';
import {
  AlertCircle,
  Bell,
  CheckCircle,
  CheckCircle2,
  Filter,
  MapPinned,
  Radio,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
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
import { Button } from '@/shared/components/ui/Button';

type AlertMetricTone = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface AlertMetricItem {
  label: string;
  value: string | number;
  helper: string;
  tone: AlertMetricTone;
  icon: JSX.Element;
}

const PAGE_SIZE = 20;
  function normalizeDisplayText(value: string | null | undefined) {
    if (!value) return '';

    return value
    .replaceAll('Ã¡', 'á')
    .replaceAll('Ã©', 'é')
    .replaceAll('Ã­', 'í')
    .replaceAll('Ã³', 'ó')
    .replaceAll('Ãº', 'ú')
    .replaceAll('Ã±', 'ñ')
    .replaceAll('Ã', 'Á')
    .replaceAll('Ã‰', 'É')
    .replaceAll('Ã', 'Í')
    .replaceAll('Ã“', 'Ó')
    .replaceAll('Ãš', 'Ú')
    .replaceAll('Ã‘', 'Ñ')
    .replaceAll('Â¿', '¿')
    .replaceAll('Â¡', '¡')
    .replaceAll('Â°', '°');
}

const alertToneLabel: Record<AlertMetricTone, string> = {
  default: 'Operativo',
  success: 'Estable',
  warning: 'Seguimiento',
  danger: 'Atención',
  info: 'Monitoreo',
};

function getTypeIcon(type: AlertType) {
  if (type === 'EXIT_GEOFENCE') return <MapPinned size={15} />;
  if (type === 'COLLAR_OFFLINE') return <Radio size={15} />;
  if (type === 'LOW_BATTERY') return <Bell size={15} />;
  return <Bell size={15} />;
}

function getStatusPremiumClass(status: AlertStatus) {
  if (status === 'PENDIENTE') return 'alerts-status-pending';
  if (status === 'RESUELTA') return 'alerts-status-resolved';
  return 'alerts-status-discarded';
}

function getTypePremiumClass(type: AlertType) {
  if (type === 'EXIT_GEOFENCE') return 'alerts-type-geofence';
  if (type === 'COLLAR_OFFLINE') return 'alerts-type-collar';
  if (type === 'LOW_BATTERY') return 'alerts-type-default';
  return 'alerts-type-default';
}

export function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<AlertStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<AlertType | ''>('');
  const [resolveModal, setResolveModal] = useState<{
    alert: AlertResponse;
    action: 'resolve' | 'discard';
  } | null>(null);
  const [observations, setObservations] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { hasAnyRole } = useAuthStore();
  const canManage = hasAnyRole(['ADMINISTRADOR']);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

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
        setRefreshing(false);
      }
    },
    [statusFilter, typeFilter, page],
  );

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
      void load(true);
    } catch (err) {
      toast.error(AppError.from(err).serverMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const clearFilters = () => {
    setStatusFilter('');
    setTypeFilter('');
    setPage(0);
  };

  const pendingCount = alerts.filter((alert) => alert.status === 'PENDIENTE').length;
  const resolvedCount = alerts.filter((alert) => alert.status === 'RESUELTA').length;
  const discardedCount = alerts.filter((alert) => alert.status === 'DESCARTADA').length;
  const geofenceCount = alerts.filter((alert) => alert.type === 'EXIT_GEOFENCE').length;
  const collarCount = alerts.filter((alert) => alert.type === 'COLLAR_OFFLINE').length;
  const hasFilters = Boolean(statusFilter || typeFilter);
  const metrics: AlertMetricItem[] = [
    {
      label: 'Registros visibles',
      value: alerts.length,
      helper: 'Alertas cargadas con los filtros actuales.',
      tone: 'info',
      icon: <Bell size={24} />,
    },
    {
      label: 'Pendientes',
      value: pendingCount,
      helper:
        pendingCount > 0
          ? 'Eventos que requieren atención operativa.'
          : 'Sin alertas pendientes en esta página.',
      tone: pendingCount > 0 ? 'danger' : 'success',
      icon: <AlertCircle size={24} />,
    },
    {
      label: 'Resueltas',
      value: resolvedCount,
      helper: 'Casos cerrados correctamente en el corte actual.',
      tone: 'success',
      icon: <CheckCircle size={24} />,
    },
    {
      label: 'Descartadas',
      value: discardedCount,
      helper: 'Eventos cerrados sin acción correctiva.',
      tone: 'warning',
      icon: <XCircle size={24} />,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Eventos priorizados"
        title="Alertas"
        badge="Panel de seguimiento"
        subtitle="Filtra incidentes por tipo y estado para revisar qué necesita atención inmediata dentro del flujo operativo."
        actions={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void load(true)}
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? 'spin-icon' : ''} />
            Actualizar
          </Button>
        }
      />

      <PageContainer>
        <section className="alerts-premium-hero card">
          <div className="alerts-premium-hero-copy">
            <span className="alerts-premium-eyebrow">
              <Sparkles size={14} />
              Centro de respuesta
            </span>

            <h2>Gestión visual de incidentes del hato y dispositivos GPS</h2>

            <p>
              Supervisa salidas de geocerca, collares sin señal y eventos pendientes
              con una vista ejecutiva orientada a la toma de decisiones.
            </p>

            <div className="alerts-premium-hero-pills">
              <span>
                <ShieldAlert size={14} />
                {pendingCount} pendientes
              </span>
              <span>
                <MapPinned size={14} />
                {geofenceCount} geocerca
              </span>
              <span>
                <Radio size={14} />
                {collarCount} collares
              </span>
            </div>
          </div>

          <div className="alerts-premium-hero-side">
            <div className="alerts-premium-mini-card">
              <span>Total acumulado</span>
              <strong>{total}</strong>
              <small>Alertas registradas según filtros activos</small>
            </div>
          </div>
        </section>

        <section className="alerts-premium-metrics">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className={`alerts-premium-metric alerts-premium-metric-${metric.tone}`}
            >
              <div className="alerts-premium-metric-glow" />

              <div className="alerts-premium-metric-top">
                <div className="alerts-premium-metric-icon">{metric.icon}</div>

                <span className="alerts-premium-metric-status">
                  <Sparkles size={13} />
                  {alertToneLabel[metric.tone]}
                </span>
              </div>

              <div className="alerts-premium-metric-copy">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <p>{metric.helper}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="card alerts-premium-toolbar">
          <div className="alerts-premium-toolbar-main">
            <div className="alerts-premium-toolbar-title">
              <Filter size={17} />
              <div>
                <strong>Filtros operativos</strong>
                <span>Refina la búsqueda por estado y tipo de incidente.</span>
              </div>
            </div>

            <div className="alerts-premium-filters">
              <select
                className="form-select alerts-premium-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as AlertStatus | '');
                  setPage(0);
                }}
              >
                <option value="">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="RESUELTA">Resuelta</option>
                <option value="DESCARTADA">Descartada</option>
              </select>

              <select
                className="form-select alerts-premium-select"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as AlertType | '');
                  setPage(0);
                }}
              >
                <option value="">Todos los tipos</option>
                <option value="EXIT_GEOFENCE">Salida de geocerca</option>
                <option value="COLLAR_OFFLINE">Collar sin señal</option>
                <option value="LOW_BATTERY">Batería crítica</option>
              </select>

              {hasFilters ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={clearFilters}
                >
                  Limpiar filtros
                </button>
              ) : null}
            </div>
          </div>

          <div className="alerts-premium-toolbar-note">
            {total} alertas acumuladas en el entorno operativo
          </div>
        </section>

        {loading ? (
          <div className="loading-center">
            <div className="loading-spinner" />
          </div>
        ) : (
          <>
            <section className="card alerts-premium-table-panel">
              <div className="card-header alerts-premium-table-header">
                <div>
                  <span className="card-title">Detalle de alertas</span>
                  <p className="alerts-premium-section-subtitle">
                    Seguimiento de eventos, animales asociados, estado y acciones disponibles.
                  </p>
                </div>

                <span className="alerts-premium-table-badge">
                  Página {totalPages > 0 ? page + 1 : 0} de {totalPages}
                </span>
              </div>

              <div className="card-body">
                <div className="alerts-premium-table-shell">
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
                        {canManage ? <th style={{ width: 120 }}>Acciones</th> : null}
                      </tr>
                    </thead>

                    <tbody>
                      {alerts.length === 0 ? (
                        <tr>
                          <td colSpan={canManage ? 8 : 7}>
                            <div className="empty-state">
                              <Bell size={32} className="empty-state-icon" />
                              <span className="empty-state-text">
                                No se encontraron alertas para los filtros seleccionados.
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        alerts.map((alert) => (
                          <tr key={alert.id}>
                            <td className="td-mono">#{alert.id}</td>

                            <td>
                              <span
                                className={`alerts-type-chip ${getTypePremiumClass(
                                  alert.type,
                                )}`}
                              >
                                {getTypeIcon(alert.type)}
                                {ALERT_TYPE_LABELS[alert.type]}
                              </span>
                            </td>

                            <td>
                              <div className="alerts-message-cell">
                                <strong>{normalizeDisplayText(alert.message)}</strong>
                                <span>Evento operativo registrado por el sistema.</span>
                              </div>
                            </td>

                            <td>
                              <span className="alerts-cow-chip">
                                {alert.cowName ?? 'Sin vaca asociada'}
                              </span>
                            </td>

                            <td>
                              <span
                                className={`badge ${ALERT_STATUS_COLORS[alert.status]} alerts-status-chip ${getStatusPremiumClass(
                                  alert.status,
                                )}`}
                              >
                                {ALERT_STATUS_LABELS[alert.status]}
                              </span>
                            </td>

                            <td className="td-mono">{formatDateTime(alert.createdAt)}</td>

                            <td>
                              <span className="alerts-observation-text">
                               {normalizeDisplayText(alert.observations) || '—'}
                              </span>
                            </td>

                            {canManage ? (
                              <td>
                                {alert.status === 'PENDIENTE' ? (
                                  <div className="alerts-actions-cell">
                                    <button
                                      type="button"
                                      className="btn btn-success btn-icon btn-sm alerts-action-btn"
                                      onClick={() => {
                                        setResolveModal({ alert, action: 'resolve' });
                                        setObservations('');
                                      }}
                                      title="Resolver"
                                    >
                                      <CheckCircle size={13} />
                                    </button>

                                    <button
                                      type="button"
                                      className="btn btn-danger btn-icon btn-sm alerts-action-btn"
                                      onClick={() => {
                                        setResolveModal({ alert, action: 'discard' });
                                        setObservations('');
                                      }}
                                      title="Descartar"
                                    >
                                      <XCircle size={13} />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="alerts-no-actions">Sin acciones</span>
                                )}
                              </td>
                            ) : null}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {totalPages > 1 ? (
              <div className="alerts-premium-pagination">
                <span>
                  Página {page + 1} de {totalPages}
                </span>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={page === 0}
                  onClick={() => setPage((current) => current - 1)}
                >
                  ← Anterior
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Siguiente →
                </button>
              </div>
            ) : null}
          </>
        )}
      </PageContainer>

      {resolveModal ? (
        <div
          className="modal-backdrop alerts-premium-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setResolveModal(null);
          }}
        >
          <div className="modal alerts-premium-modal">
            <div className="modal-header">
              <span className="modal-title">
                {resolveModal.action === 'resolve'
                  ? 'Resolver alerta'
                  : 'Descartar alerta'}
              </span>

              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => setResolveModal(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div className="alerts-premium-modal-summary">
                <div className="alerts-premium-modal-icon">
                  {resolveModal.action === 'resolve' ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <XCircle size={20} />
                  )}
                </div>

                <div>
                  <strong>{normalizeDisplayText(resolveModal.alert.message)}</strong>
                  <span>
                    {ALERT_TYPE_LABELS[resolveModal.alert.type]} ·{' '}
                    {formatDateTime(resolveModal.alert.createdAt)}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Observaciones</label>
                <textarea
                  className="form-textarea"
                  placeholder="Opcional: agrega una nota para el historial..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setResolveModal(null)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className={`btn ${
                  resolveModal.action === 'resolve' ? 'btn-success' : 'btn-danger'
                }`}
                onClick={() => void handleAction()}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span
                      className="loading-spinner"
                      style={{ width: 14, height: 14, borderWidth: 2 }}
                    />
                    Procesando...
                  </>
                ) : resolveModal.action === 'resolve' ? (
                  'Resolver alerta'
                ) : (
                  'Descartar alerta'
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}