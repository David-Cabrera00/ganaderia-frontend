import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  Beef,
  Clock,
  MapPin,
  Navigation,
  Radio,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { DashboardService } from '@/api/services';
import { AppError } from '@/api/httpClient';
import { PageContainer } from '@/layouts/components/PageContainer';
import { PageHeader } from '@/layouts/components/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { Table } from '@/shared/components/ui/Table';
import type { TableColumn } from '@/shared/types/table.types';
import { APP_ROUTES } from '@/shared/constants/appRoutes';
import type {
  AlertResponse,
  CollarResponse,
  CowResponse,
  DashboardSummary,
  LocationResponse,
} from '@/types';
import {
  ALERT_STATUS_COLORS,
  ALERT_STATUS_LABELS,
  ALERT_TYPE_LABELS,
  COLLAR_STATUS_COLORS,
  COLLAR_STATUS_LABELS,
  COW_STATUS_COLORS,
  COW_STATUS_LABELS,
  formatDateTime,
} from '@/utils/helpers';
import { DashboardMetricCard } from '@/features/dashboard/components/DashboardMetricCard';
import { DashboardHealthCard } from '@/features/dashboard/components/DashboardHealthCard';
import { DashboardOperationsMap } from '@/features/dashboard/components/DashboardOperationsMap';
import {
  buildDashboardHealth,
  buildDashboardKpis,
  buildRecentLocationFeed,
  buildWatchList,
} from '@/features/dashboard/utils/dashboard.utils';

const quickLinks = [
  {
    title: 'Gestionar vacas',
    description: 'Consulta inventario, estado del hato y datos principales.',
    to: APP_ROUTES.cows,
    icon: <Beef size={18} />,
  },
  {
    title: 'Supervisar collares',
    description: 'Revisa batería, señal, asignación y disponibilidad.',
    to: APP_ROUTES.collars,
    icon: <Radio size={18} />,
  },
  {
    title: 'Ver geocercas',
    description: 'Valida perímetros, radios, estado y cobertura.',
    to: APP_ROUTES.geofences,
    icon: <MapPin size={18} />,
  },
  {
    title: 'Atender alertas',
    description: 'Gestiona incidentes abiertos y su seguimiento.',
    to: APP_ROUTES.alerts,
    icon: <Bell size={18} />,
  },
] as const;

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [criticalAlerts, setCriticalAlerts] = useState<AlertResponse[]>([]);
  const [offlineCollars, setOfflineCollars] = useState<CollarResponse[]>([]);
  const [cowsOutside, setCowsOutside] = useState<CowResponse[]>([]);
  const [recentLocations, setRecentLocations] = useState<LocationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const [sum, alerts, collars, cows, locationsPage] = await Promise.all([
        DashboardService.getSummary(),
        DashboardService.getCriticalAlerts(),
        DashboardService.getOfflineCollars(),
        DashboardService.getCowsOutsideGeofence(),
        DashboardService.getRecentLocations(),
      ]);

      setSummary(sum);
      setCriticalAlerts(alerts);
      setOfflineCollars(collars);
      setCowsOutside(cows);
      setRecentLocations(locationsPage.slice(0, 8));
    } catch (err) {
      setError(AppError.from(err).serverMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const kpis = useMemo(() => buildDashboardKpis(summary), [summary]);
  const healthItems = useMemo(
    () => buildDashboardHealth(summary, offlineCollars, cowsOutside),
    [summary, offlineCollars, cowsOutside],
  );
  const watchItems = useMemo(
    () => buildWatchList(criticalAlerts, offlineCollars, cowsOutside),
    [criticalAlerts, offlineCollars, cowsOutside],
  );
  const locationFeed = useMemo(
    () => buildRecentLocationFeed(recentLocations),
    [recentLocations],
  );

  const alertColumns: Array<TableColumn<AlertResponse>> = useMemo(
    () => [
      {
        key: 'type',
        header: 'Tipo',
        render: (alert) => ALERT_TYPE_LABELS[alert.type],
      },
      {
        key: 'cow',
        header: 'Vaca',
        render: (alert) => alert.cowName ?? 'Sin vaca asociada',
      },
      {
        key: 'status',
        header: 'Estado',
        render: (alert) => (
          <span className={`badge ${ALERT_STATUS_COLORS[alert.status]}`}>
            {ALERT_STATUS_LABELS[alert.status]}
          </span>
        ),
      },
      {
        key: 'createdAt',
        header: 'Fecha',
        className: 'td-mono',
        render: (alert) => formatDateTime(alert.createdAt),
      },
    ],
    [],
  );

  if (loading) {
    return (
      <>
        <PageHeader
          eyebrow="Monitoreo inteligente"
          title="Centro de control"
          subtitle="Cargando indicadores operativos del sistema."
        />
        <PageContainer>
          <div className="loading-center">
            <div className="loading-spinner" />
          </div>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Monitoreo inteligente"
        title="Centro de control"
        badge="Monitoreo activo"
        subtitle={
          summary?.latestLocationTimestamp
            ? `Último evento GPS registrado el ${formatDateTime(
                summary.latestLocationTimestamp,
              )}.`
            : 'Sin ubicaciones recientes registradas.'
        }
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void load(true)}
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? 'spin-icon' : ''} />
            Actualizar panel
          </Button>
        }
      />

      <PageContainer>
        {error ? <div className="alert-banner error">{error}</div> : null}

        <section className="dashboard-hero card">
          <div className="dashboard-hero-copy">
            <Badge variant={criticalAlerts.length > 0 ? 'red' : 'green'}>
              {criticalAlerts.length > 0
                ? 'Monitoreo con incidencias'
                : 'Operación estable'}
            </Badge>

            <h2>Visión operativa del hato, los perímetros y los collares GPS</h2>

            <p>
              Este tablero resume el estado del monitoreo ganadero, prioriza
              incidentes críticos y concentra los indicadores clave de la operación.
            </p>

            <div className="dashboard-hero-pills">
              <span className="dashboard-hero-pill">
                <ShieldCheck size={14} /> Operación monitoreada
              </span>
              <span className="dashboard-hero-pill">
                <Navigation size={14} /> Trazabilidad y geocercas
              </span>
              <span className="dashboard-hero-pill">
                <Clock size={14} /> Respuesta operativa
              </span>
            </div>
          </div>

          <div className="dashboard-hero-side">
            <div className="dashboard-hero-mini-card">
              <span>Alertas de salida</span>
              <strong>{summary?.pendingExitGeofenceAlerts ?? 0}</strong>
              <small>Eventos de geocerca pendientes</small>
            </div>

            <div className="dashboard-hero-mini-card">
              <span>Alertas por collar offline</span>
              <strong>{summary?.pendingCollarOfflineAlerts ?? 0}</strong>
              <small>Dispositivos que requieren seguimiento</small>
            </div>
          </div>
        </section>

        {summary ? (
          <section className="dashboard-kpi-grid">
            <DashboardMetricCard icon={<Beef size={22} />} {...kpis[0]} />
            <DashboardMetricCard icon={<MapPin size={22} />} {...kpis[1]} />
            <DashboardMetricCard icon={<Radio size={22} />} {...kpis[2]} />
            <DashboardMetricCard icon={<Bell size={22} />} {...kpis[3]} />
          </section>
        ) : (
          <section className="card">
            <div className="card-body">
              <EmptyState
                title="No se pudo cargar el resumen operativo"
                description="Vuelve a actualizar el panel para intentarlo de nuevo."
              />
            </div>
          </section>
        )}

        <DashboardOperationsMap locations={recentLocations} />

        <section className="card map-shell">
          <div className="card-header">
            <span className="card-title">Módulos operativos</span>
          </div>

          <div className="card-body">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 16,
              }}
            >
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    padding: 18,
                    border: '1px solid var(--border)',
                    borderRadius: 18,
                    background: 'var(--bg-surface)',
                    textDecoration: 'none',
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--accent-dim)',
                      color: 'var(--accent)',
                      flexShrink: 0,
                    }}
                  >
                    {link.icon}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <strong
                      style={{ fontSize: '1rem', color: 'var(--text-primary)' }}
                    >
                      {link.title}
                    </strong>
                    <span
                      style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem',
                        lineHeight: 1.5,
                      }}
                    >
                      {link.description}
                    </span>
                    <small
                      style={{
                        color: 'var(--accent)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                      }}
                    >
                      Abrir módulo →
                    </small>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="dashboard-stack">
          <section className="card">
            <div className="card-header">
              <span className="card-title">Radar operativo</span>
              <Badge variant="blue">Resumen</Badge>
            </div>
            <div className="card-body dashboard-health-grid">
              {healthItems.map((item) => (
                <DashboardHealthCard key={item.title} item={item} />
              ))}
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <span className="card-title">Prioridad inmediata</span>
              <Badge variant={watchItems.length > 0 ? 'yellow' : 'green'}>
                {watchItems.length}
              </Badge>
            </div>

            <div className="card-body" style={{ paddingTop: 16 }}>
              {watchItems.length === 0 ? (
                <EmptyState
                  title="Sin frentes urgentes"
                  description="El monitoreo no muestra frentes urgentes para este turno."
                />
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 14,
                  }}
                >
                  {watchItems.map((item) => {
                    const tone =
                      item.tone === 'danger'
                        ? {
                            border: '1px solid rgba(239, 107, 99, 0.22)',
                            background: 'rgba(239, 107, 99, 0.06)',
                            dot: 'var(--red)',
                          }
                        : item.tone === 'warning'
                        ? {
                            border: '1px solid rgba(214, 179, 106, 0.22)',
                            background: 'rgba(214, 179, 106, 0.06)',
                            dot: 'var(--accent)',
                          }
                        : {
                            border: '1px solid rgba(91, 140, 255, 0.18)',
                            background: 'rgba(91, 140, 255, 0.05)',
                            dot: 'var(--blue)',
                          };

                    return (
                      <article
                        key={item.id}
                        style={{
                          border: tone.border,
                          background: tone.background,
                          borderRadius: 16,
                          padding: 14,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                          minHeight: 120,
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
                              fontSize: '1rem',
                              color: 'var(--text-primary)',
                            }}
                          >
                            {item.title}
                          </strong>
                        </div>

                        <span
                          style={{
                            display: 'block',
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem',
                            lineHeight: 1.5,
                          }}
                        >
                          {item.subtitle}
                        </span>

                        <small
                          style={{
                            display: 'block',
                            color: 'var(--text-muted)',
                            fontSize: '0.78rem',
                          }}
                        >
                          {item.meta}
                        </small>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <span className="card-title">Actividad de ubicación</span>
              <Badge variant="blue">{locationFeed.length}</Badge>
            </div>

            <div className="card-body" style={{ paddingTop: 16 }}>
              {locationFeed.length === 0 ? (
                <EmptyState
                  title="Sin lecturas recientes"
                  description="Aún no hay ubicaciones disponibles para mostrar en el panel."
                />
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 14,
                  }}
                >
                  {locationFeed.map((item) => {
                    const tone =
                      item.tone === 'danger'
                        ? {
                            border: '1px solid rgba(239, 107, 99, 0.22)',
                            background: 'rgba(239, 107, 99, 0.06)',
                            dot: 'var(--red)',
                          }
                        : item.tone === 'warning'
                        ? {
                            border: '1px solid rgba(214, 179, 106, 0.22)',
                            background: 'rgba(214, 179, 106, 0.06)',
                            dot: 'var(--accent)',
                          }
                        : {
                            border: '1px solid rgba(91, 140, 255, 0.18)',
                            background: 'rgba(91, 140, 255, 0.05)',
                            dot: 'var(--blue)',
                          };

                    return (
                      <article
                        key={item.id}
                        style={{
                          border: tone.border,
                          background: tone.background,
                          borderRadius: 16,
                          padding: 14,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                          minHeight: 120,
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
                              fontSize: '1rem',
                              color: 'var(--text-primary)',
                            }}
                          >
                            {item.title}
                          </strong>
                        </div>

                        <span
                          style={{
                            display: 'block',
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem',
                            lineHeight: 1.5,
                          }}
                        >
                          {item.subtitle}
                        </span>

                        <small
                          style={{
                            display: 'block',
                            color: 'var(--text-muted)',
                            fontSize: '0.78rem',
                          }}
                        >
                          {item.meta}
                        </small>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <span className="card-title">Alertas críticas recientes</span>
              <Badge variant={criticalAlerts.length > 0 ? 'red' : 'green'}>
                {criticalAlerts.length}
              </Badge>
            </div>
            <div className="card-body">
              <Table
                columns={alertColumns}
                data={criticalAlerts.slice(0, 8)}
                emptyMessage="No hay alertas críticas en este momento."
                rowKey={(alert) => alert.id}
              />
            </div>
          </section>
        </section>

        <section className="dashboard-secondary-grid">
          <section className="card">
            <div className="card-header">
              <span className="card-title">Vacas fuera de geocerca</span>
              <Badge variant={cowsOutside.length > 0 ? 'red' : 'green'}>
                {cowsOutside.length}
              </Badge>
            </div>
            <div className="card-body">
              {cowsOutside.length === 0 ? (
                <EmptyState
                  title="Todo el hato está dentro del perímetro"
                  description="No hay animales fuera de geocerca en este momento."
                />
              ) : (
                <div className="dashboard-entity-list">
                  {cowsOutside.map((cow) => (
                    <article key={cow.id} className="dashboard-entity-item">
                      <div>
                        <strong>{cow.name}</strong>
                        <span>{cow.token}</span>
                      </div>
                      <span className={`badge ${COW_STATUS_COLORS[cow.status]}`}>
                        {COW_STATUS_LABELS[cow.status]}
                      </span>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <span className="card-title">Collares sin señal o mantenimiento</span>
              <Badge variant={offlineCollars.length > 0 ? 'yellow' : 'green'}>
                {offlineCollars.length}
              </Badge>
            </div>
            <div className="card-body">
              {offlineCollars.length === 0 ? (
                <EmptyState
                  title="Collares operando con normalidad"
                  description="No hay dispositivos sin señal en el registro actual."
                />
              ) : (
                <div className="dashboard-entity-list">
                  {offlineCollars.map((collar) => (
                    <article key={collar.id} className="dashboard-entity-item">
                      <div>
                        <strong>{collar.token}</strong>
                        <span>
                          {collar.cowName ?? 'Sin asignación'} ·{' '}
                          {collar.lastSeenAt
                            ? formatDateTime(collar.lastSeenAt)
                            : 'Sin última señal'}
                        </span>
                      </div>
                      <span
                        className={`badge ${COLLAR_STATUS_COLORS[collar.status]}`}
                      >
                        {COLLAR_STATUS_LABELS[collar.status]}
                      </span>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </section>

        <section className="dashboard-footer-note">
          <AlertTriangle size={15} />
          Revise las alertas críticas y el estado de los dispositivos para mantener
          la operación bajo control.
        </section>
      </PageContainer>
    </>
  );
}