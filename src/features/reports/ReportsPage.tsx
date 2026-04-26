import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  Download,
  FileText,
  MapPinned,
  Radio,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { DashboardService } from '@/api/services';
import { AppError } from '@/shared/errors/AppError';
import { PageContainer } from '@/layouts/components/PageContainer';
import { PageHeader } from '@/layouts/components/PageHeader';
import { ReportMetricCard } from '@/features/reports/components/ReportMetricCard';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { Loader } from '@/shared/components/ui/Loader';
import { Table } from '@/shared/components/ui/Table';
import type {
  AlertResponse,
  CowResponse,
  DashboardSummary,
  LocationResponse,
} from '@/types';
import {
  ALERT_TYPE_LABELS,
  COW_STATUS_LABELS,
  formatDateTime,
} from '@/utils/helpers';

type InsightTone = 'success' | 'warning' | 'danger' | 'info';
type ReportTab = 'alerts' | 'cows' | 'locations';

interface InsightItem {
  id: string;
  title: string;
  description: string;
  recommendation: string;
  tone: InsightTone;
}

const insightToneStyles: Record<
  InsightTone,
  { border: string; background: string; dot: string }
> = {
  success: {
    border: '1px solid rgba(91, 140, 255, 0.18)',
    background: 'rgba(91, 140, 255, 0.05)',
    dot: 'var(--blue)',
  },
  info: {
    border: '1px solid rgba(91, 140, 255, 0.18)',
    background: 'rgba(91, 140, 255, 0.05)',
    dot: 'var(--blue)',
  },
  warning: {
    border: '1px solid rgba(214, 179, 106, 0.22)',
    background: 'rgba(214, 179, 106, 0.06)',
    dot: 'var(--accent)',
  },
  danger: {
    border: '1px solid rgba(239, 107, 99, 0.22)',
    background: 'rgba(239, 107, 99, 0.06)',
    dot: 'var(--red)',
  },
};

export function ReportsPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [criticalAlerts, setCriticalAlerts] = useState<AlertResponse[]>([]);
  const [recentLocations, setRecentLocations] = useState<LocationResponse[]>([]);
  const [cowsOutside, setCowsOutside] = useState<CowResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ReportTab>('alerts');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [summaryResult, alertsResult, locationsResult, cowsOutsideResult] =
        await Promise.all([
          DashboardService.getSummary(),
          DashboardService.getCriticalAlerts(),
          DashboardService.getRecentLocations(),
          DashboardService.getCowsOutsideGeofence(),
        ]);

      setSummary(summaryResult);
      setCriticalAlerts(alertsResult);
      setRecentLocations(locationsResult);
      setCowsOutside(cowsOutsideResult);
    } catch (err) {
      setError(AppError.from(err).serverMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const coveragePercentage = useMemo(() => {
    if (!summary || summary.totalCows === 0) return 0;
    return Math.max(
      0,
      Math.round(
        ((summary.totalCows - summary.cowsOutsideGeofence) / summary.totalCows) * 100,
      ),
    );
  }, [summary]);

  const smartInsights = useMemo<InsightItem[]>(() => {
    if (!summary) return [];

    const items: InsightItem[] = [];

    if (summary.pendingAlerts > 0) {
      items.push({
        id: 'pending-alerts',
        title: 'Alertas que requieren gestión',
        description: `Se registran ${summary.pendingAlerts} eventos pendientes de atención operativa.`,
        recommendation:
          'Prioriza revisión y cierre de incidentes abiertos con mayor antigüedad.',
        tone: 'danger',
      });
    }

    if (summary.offlineCollars > 0) {
      items.push({
        id: 'offline-collars',
        title: 'Riesgo por collares offline',
        description: `${summary.offlineCollars} dispositivo(s) presentan pérdida de señal o indisponibilidad.`,
        recommendation:
          'Verifica batería, conectividad y estado físico del collar.',
        tone: 'warning',
      });
    }

    if (summary.cowsOutsideGeofence > 0) {
      items.push({
        id: 'outside-geofence',
        title: 'Animales fuera de perímetro',
        description: `${summary.cowsOutsideGeofence} vaca(s) aparecen fuera de geocerca en el corte actual.`,
        recommendation:
          'Valida ubicación, geocerca asociada y seguimiento del evento.',
        tone: 'danger',
      });
    }

    if (coveragePercentage >= 95) {
      items.push({
        id: 'coverage-stable',
        title: 'Cobertura operativa estable',
        description: `La cobertura estimada del monitoreo se mantiene en ${coveragePercentage}%.`,
        recommendation:
          'Mantén el seguimiento preventivo de dispositivos y trazabilidad.',
        tone: 'success',
      });
    } else {
      items.push({
        id: 'coverage-review',
        title: 'Cobertura por revisar',
        description: `La cobertura operativa actual es de ${coveragePercentage}% y necesita fortalecerse.`,
        recommendation:
          'Revisa salidas de perímetro, collares offline y consistencia del flujo GPS.',
        tone: 'warning',
      });
    }

    return items.slice(0, 4);
  }, [summary, coveragePercentage]);

  const executiveActions = useMemo(() => {
    if (!summary) return [];

    const actions: string[] = [];

    if (summary.pendingAlerts > 0) {
      actions.push('Atender primero las alertas críticas y pendientes del turno.');
    }

    if (summary.offlineCollars > 0) {
      actions.push('Programar revisión técnica de collares sin señal o en mantenimiento.');
    }

    if (summary.cowsOutsideGeofence > 0) {
      actions.push('Verificar animales fuera del perímetro y validar el contexto del evento.');
    }

    if (summary.latestLocationTimestamp) {
      actions.push(
        `Tomar como referencia la última lectura registrada el ${formatDateTime(
          summary.latestLocationTimestamp,
        )}.`,
      );
    }

    if (actions.length === 0) {
      actions.push(
        'Mantener monitoreo preventivo y validación periódica de consistencia operativa.',
      );
    }

    return actions.slice(0, 4);
  }, [summary]);

  const executiveTone =
    (summary?.pendingAlerts ?? 0) > 0
      ? 'Requiere seguimiento'
      : (summary?.offlineCollars ?? 0) > 0
      ? 'Atención preventiva'
      : 'Operación estable';

  if (loading) {
    return (
      <>
        <PageHeader
          eyebrow="Centro analítico"
          title="Reportes"
          subtitle="Cargando indicadores ejecutivos y análisis del sistema."
          badge="Análisis ejecutivo"
        />
        <PageContainer>
          <Loader />
        </PageContainer>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader
          eyebrow="Centro analítico"
          title="Reportes"
          subtitle="Cargando indicadores ejecutivos y análisis del sistema."
          badge="Análisis ejecutivo"
        />
        <PageContainer>
          <div className="alert-banner error">{error}</div>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Centro analítico"
        title="Reportes"
        subtitle="Vista consolidada para seguimiento ejecutivo, hallazgos operativos y base de análisis inteligente."
        badge="Análisis ejecutivo"
        actions={
          <Button type="button" variant="secondary" size="sm">
            <Download size={14} />
            Exportación futura
          </Button>
        }
      />

      <PageContainer>
        {summary ? (
          <div className="stat-grid">
            <ReportMetricCard
              title="Alertas pendientes"
              value={summary.pendingAlerts}
              description="Eventos que requieren atención operativa."
              icon={<Bell size={28} />}
              tone={summary.pendingAlerts > 0 ? 'danger' : 'success'}
            />
            <ReportMetricCard
              title="Collares offline"
              value={summary.offlineCollars}
              description="Dispositivos con pérdida de señal o indisponibilidad."
              icon={<Radio size={28} />}
              tone={summary.offlineCollars > 0 ? 'warning' : 'success'}
            />
            <ReportMetricCard
              title="Vacas fuera"
              value={summary.cowsOutsideGeofence}
              description="Animales fuera del perímetro configurado."
              icon={<MapPinned size={28} />}
              tone={summary.cowsOutsideGeofence > 0 ? 'danger' : 'success'}
            />
            <ReportMetricCard
              title="Cobertura operativa"
              value={`${coveragePercentage}%`}
              description="Estimación de control actual sobre el hato monitoreado."
              icon={<ShieldCheck size={28} />}
              tone={coveragePercentage >= 95 ? 'success' : 'warning'}
            />
          </div>
        ) : null}

        <section className="card" style={{ marginTop: 18 }}>
          <div className="card-header">
            <span className="card-title">Análisis inteligente del sistema</span>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: 'var(--accent)',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              <Sparkles size={14} />
              IA analítica
            </div>
          </div>

          <div className="card-body">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 14,
              }}
            >
              {smartInsights.map((item) => {
                const tone = insightToneStyles[item.tone];

                return (
                  <article
                    key={item.id}
                    style={{
                      border: tone.border,
                      background: tone.background,
                      borderRadius: 16,
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          background: tone.dot,
                          flexShrink: 0,
                        }}
                      />
                      <strong
                        style={{
                          fontSize: '0.98rem',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {item.title}
                      </strong>
                    </div>

                    <span
                      style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem',
                        lineHeight: 1.55,
                      }}
                    >
                      {item.description}
                    </span>

                    <small
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem',
                        lineHeight: 1.5,
                      }}
                    >
                      Sugerencia: {item.recommendation}
                    </small>
                  </article>
                );
              })}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 16,
                marginTop: 18,
              }}
            >
              <section
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  background: 'var(--bg-surface)',
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    marginBottom: 14,
                  }}
                >
                  <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                    Estado ejecutivo
                  </strong>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      color:
                        executiveTone === 'Operación estable'
                          ? 'var(--blue)'
                          : executiveTone === 'Atención preventiva'
                          ? 'var(--accent)'
                          : 'var(--red)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                    }}
                  >
                    <Activity size={14} />
                    {executiveTone}
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: 14,
                      padding: 12,
                      background: 'var(--bg-base)',
                    }}
                  >
                    <div className="report-summary-label">Última ubicación</div>
                    <strong>{formatDateTime(summary?.latestLocationTimestamp ?? null)}</strong>
                  </div>

                  <div
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: 14,
                      padding: 12,
                      background: 'var(--bg-base)',
                    }}
                  >
                    <div className="report-summary-label">Alertas geocerca</div>
                    <strong>{summary?.pendingExitGeofenceAlerts ?? 0}</strong>
                  </div>

                  <div
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: 14,
                      padding: 12,
                      background: 'var(--bg-base)',
                    }}
                  >
                    <div className="report-summary-label">Alertas collar offline</div>
                    <strong>{summary?.pendingCollarOfflineAlerts ?? 0}</strong>
                  </div>

                  <div
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: 14,
                      padding: 12,
                      background: 'var(--bg-base)',
                    }}
                  >
                    <div className="report-summary-label">Estado general</div>
                    <strong>{executiveTone}</strong>
                  </div>
                </div>
              </section>

              <section
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  background: 'var(--bg-surface)',
                  padding: 16,
                }}
              >
                <strong
                  style={{
                    display: 'block',
                    fontSize: '1rem',
                    color: 'var(--text-primary)',
                    marginBottom: 12,
                  }}
                >
                  Acciones sugeridas
                </strong>

                <div
                  style={{
                    display: 'grid',
                    gap: 10,
                  }}
                >
                  {executiveActions.map((action, index) => (
                    <div
                      key={`${action}-${index}`}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        padding: 12,
                        border: '1px solid var(--border)',
                        borderRadius: 14,
                        background: 'var(--bg-base)',
                      }}
                    >
                      <AlertTriangle
                        size={16}
                        style={{
                          marginTop: 2,
                          color: 'var(--accent)',
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          color: 'var(--text-secondary)',
                          fontSize: '0.9rem',
                          lineHeight: 1.55,
                        }}
                      >
                        {action}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>

        <section className="card" style={{ marginTop: 18 }}>
          <div className="card-header">
            <span className="card-title">Detalle operativo</span>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              {[
                { key: 'alerts', label: 'Alertas', value: criticalAlerts.length },
                { key: 'cows', label: 'Vacas fuera', value: cowsOutside.length },
                { key: 'locations', label: 'Trazabilidad', value: recentLocations.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={
                    activeTab === tab.key
                      ? {
                          background: 'var(--accent-dim)',
                          borderColor: 'var(--accent)',
                          color: 'var(--accent)',
                        }
                      : undefined
                  }
                  onClick={() => setActiveTab(tab.key as ReportTab)}
                >
                  {tab.label} · {tab.value}
                </button>
              ))}
            </div>
          </div>

          <div className="card-body">
            {activeTab === 'alerts' ? (
              <Table
                columns={[
                  {
                    key: 'type',
                    header: 'Tipo',
                    render: (item: AlertResponse) => ALERT_TYPE_LABELS[item.type],
                  },
                  {
                    key: 'cow',
                    header: 'Vaca',
                    render: (item: AlertResponse) => item.cowName ?? '—',
                  },
                  {
                    key: 'date',
                    header: 'Fecha',
                    render: (item: AlertResponse) => formatDateTime(item.createdAt),
                  },
                ]}
                data={criticalAlerts.slice(0, 8)}
                emptyMessage="No hay alertas críticas registradas en este momento."
                rowKey={(item) => item.id}
              />
            ) : null}

            {activeTab === 'cows' ? (
              <Table
                columns={[
                  {
                    key: 'name',
                    header: 'Nombre',
                    render: (item: CowResponse) => item.name,
                  },
                  {
                    key: 'token',
                    header: 'Token',
                    render: (item: CowResponse) => item.token,
                  },
                  {
                    key: 'status',
                    header: 'Estado',
                    render: (item: CowResponse) => COW_STATUS_LABELS[item.status],
                  },
                ]}
                data={cowsOutside}
                emptyMessage="No hay vacas fuera de geocerca en este momento."
                rowKey={(item) => item.id}
              />
            ) : null}

            {activeTab === 'locations' ? (
              recentLocations.length === 0 ? (
                <div className="empty-state">
                  <FileText size={30} className="empty-state-icon" />
                  <strong>Sin historial reciente</strong>
                  <span className="empty-state-text">
                    Todavía no hay ubicaciones recientes registradas.
                  </span>
                </div>
              ) : (
                <Table
                  columns={[
                    {
                      key: 'cowName',
                      header: 'Vaca',
                      render: (item: LocationResponse) => item.cowName,
                    },
                    {
                      key: 'coordinates',
                      header: 'Coordenadas',
                      render: (item: LocationResponse) =>
                        `${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}`,
                    },
                    {
                      key: 'inside',
                      header: 'Dentro geocerca',
                      render: (item: LocationResponse) =>
                        item.insideGeofence ? 'Sí' : 'No',
                    },
                    {
                      key: 'recordedAt',
                      header: 'Registrada',
                      render: (item: LocationResponse) =>
                        formatDateTime(item.recordedAt),
                    },
                  ]}
                  data={recentLocations.slice(0, 8)}
                  rowKey={(item) => item.id}
                />
              )
            ) : null}
          </div>
        </section>
      </PageContainer>
    </>
  );
}