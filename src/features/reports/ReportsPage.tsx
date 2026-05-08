import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
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

const insightToneMeta: Record<
  InsightTone,
  {
    label: string;
    dotClass: string;
    cardClass: string;
  }
> = {
  success: {
    label: 'Estable',
    dotClass: 'report-insight-dot-success',
    cardClass: 'report-insight-success',
  },
  info: {
    label: 'Monitoreo',
    dotClass: 'report-insight-dot-info',
    cardClass: 'report-insight-info',
  },
  warning: {
    label: 'Preventivo',
    dotClass: 'report-insight-dot-warning',
    cardClass: 'report-insight-warning',
  },
  danger: {
    label: 'Crítico',
    dotClass: 'report-insight-dot-danger',
    cardClass: 'report-insight-danger',
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

  const executiveToneClass =
    executiveTone === 'Operación estable'
      ? 'report-tone-stable'
      : executiveTone === 'Atención preventiva'
      ? 'report-tone-warning'
      : 'report-tone-danger';

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
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              window.alert('La exportación de reportes estará disponible próximamente.')
            }
          >
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

        <section className="card report-panel" style={{ marginTop: 18 }}>
          <div className="card-header report-panel-header">
            <span className="card-title">Análisis inteligente del sistema</span>

            <div className="report-panel-badge">
              <Sparkles size={14} />
              IA analítica
            </div>
          </div>

          <div className="card-body">
            <div className="report-insights-grid">
              {smartInsights.map((item) => {
                const tone = insightToneMeta[item.tone];

                return (
                  <article
                    key={item.id}
                    className={`report-insight-card ${tone.cardClass}`}
                  >
                    <div className="report-insight-top">
                      <div className="report-insight-heading">
                        <span className={`report-insight-dot ${tone.dotClass}`} />
                        <strong>{item.title}</strong>
                      </div>

                      <span className="report-insight-badge">{tone.label}</span>
                    </div>

                    <p className="report-insight-description">{item.description}</p>

                    <div className="report-insight-recommendation">
                      <span>Sugerencia</span>
                      <p>{item.recommendation}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="report-executive-grid">
              <section className="report-subpanel">
                <div className="report-subpanel-header">
                  <strong>Estado ejecutivo</strong>

                  <div className={`report-tone-badge ${executiveToneClass}`}>
                    <Activity size={14} />
                    {executiveTone}
                  </div>
                </div>

                <div className="report-summary-grid">
                  <div className="report-summary-metric">
                    <span className="report-summary-label">Última ubicación</span>
                    <strong>{formatDateTime(summary?.latestLocationTimestamp ?? null)}</strong>
                  </div>

                  <div className="report-summary-metric">
                    <span className="report-summary-label">Alertas geocerca</span>
                    <strong>{summary?.pendingExitGeofenceAlerts ?? 0}</strong>
                  </div>

                  <div className="report-summary-metric">
                    <span className="report-summary-label">Alertas collar offline</span>
                    <strong>{summary?.pendingCollarOfflineAlerts ?? 0}</strong>
                  </div>

                  <div className="report-summary-metric">
                    <span className="report-summary-label">Estado general</span>
                    <strong>{executiveTone}</strong>
                  </div>
                </div>
              </section>

              <section className="report-subpanel">
                <div className="report-subpanel-header">
                  <strong>Acciones sugeridas</strong>

                  <div className="report-tone-badge report-tone-warning">
                    <AlertTriangle size={14} />
                    Prioridad operativa
                  </div>
                </div>

                <div className="report-actions-list">
                  {executiveActions.map((action, index) => (
                    <div key={`${action}-${index}`} className="report-action-item">
                      <div className="report-action-icon">
                        <CheckCircle2 size={16} />
                      </div>

                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>

        <section className="card report-panel" style={{ marginTop: 18 }}>
          <div className="card-header report-panel-header">
            <span className="card-title">Detalle operativo</span>

            <div className="report-detail-tabs">
              {[
                { key: 'alerts', label: 'Alertas', value: criticalAlerts.length },
                { key: 'cows', label: 'Vacas fuera', value: cowsOutside.length },
                { key: 'locations', label: 'Trazabilidad', value: recentLocations.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`report-tab-chip ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key as ReportTab)}
                >
                  {tab.label} · {tab.value}
                </button>
              ))}
            </div>
          </div>

          <div className="card-body">
            <div className="report-table-shell">
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
          </div>
        </section>
      </PageContainer>
    </>
  );
}