import type {
  AlertResponse,
  CollarResponse,
  CowResponse,
  DashboardSummary,
  LocationResponse,
} from '@/types';
import type {
  DashboardHealthItem,
  DashboardKpiItem,
  DashboardWatchItem,
} from '@/features/dashboard/types/dashboard.types';
import {
  ALERT_TYPE_LABELS,
  COLLAR_STATUS_LABELS,
  COW_STATUS_LABELS,
  SIGNAL_STATUS_LABELS,
  formatDateTime,
} from '@/utils/helpers';

export const hasDashboardIncidents = (summary: DashboardSummary | null) => Boolean(summary && summary.pendingAlerts > 0);

export const buildDashboardKpis = (summary: DashboardSummary | null): DashboardKpiItem[] => {
  if (!summary) return [];

  return [
    {
      label: 'Hato monitoreado',
      value: String(summary.totalCows),
      tone: 'default',
      helper: 'Animales registrados en seguimiento local.',
    },
    {
      label: 'Vacas fuera del perímetro',
      value: String(summary.cowsOutsideGeofence),
      tone: summary.cowsOutsideGeofence > 0 ? 'danger' : 'success',
      helper: summary.cowsOutsideGeofence > 0 ? 'Requieren revisión prioritaria.' : 'Sin salidas activas de geocerca.',
    },
    {
      label: 'Collares operativos',
      value: `${summary.activeCollars}/${summary.totalCollars}`,
      tone: 'info',
      helper: 'Dispositivos con actividad reciente.',
    },
    {
      label: 'Alertas pendientes',
      value: String(summary.pendingAlerts),
      tone: summary.pendingAlerts > 0 ? 'danger' : 'success',
      helper: summary.pendingAlerts > 0 ? 'Hay incidentes por atender.' : 'Panel sin alertas pendientes.',
    },
  ];
};

export const buildDashboardHealth = (
  summary: DashboardSummary | null,
  offlineCollars: CollarResponse[],
  cowsOutside: CowResponse[],
): DashboardHealthItem[] => {
  if (!summary) return [];

  const perimeterCoverage = summary.totalCows === 0
    ? 0
    : Math.max(0, Math.round(((summary.totalCows - summary.cowsOutsideGeofence) / summary.totalCows) * 100));

  const collarAvailability = summary.totalCollars === 0
    ? 0
    : Math.max(0, Math.round((summary.activeCollars / summary.totalCollars) * 100));

  return [
    {
      title: 'Cobertura del perímetro',
      value: `${perimeterCoverage}%`,
      description: cowsOutside.length > 0 ? `${cowsOutside.length} vaca(s) fuera de geocerca.` : 'Todos los animales siguen dentro del área controlada.',
      tone: cowsOutside.length > 0 ? 'danger' : 'success',
    },
    {
      title: 'Disponibilidad de collares',
      value: `${collarAvailability}%`,
      description: offlineCollars.length > 0 ? `${offlineCollars.length} collar(es) sin señal o deshabilitados.` : 'Todos los collares están reportando correctamente.',
      tone: offlineCollars.length > 0 ? 'warning' : 'success',
    },
    {
      title: 'Presión operativa',
      value: `${summary.pendingAlerts}`,
      description: summary.pendingAlerts > 0 ? 'Hay eventos abiertos en monitoreo y respuesta.' : 'No hay incidentes abiertos en este momento.',
      tone: summary.pendingAlerts > 0 ? 'danger' : 'info',
    },
    {
      title: 'Último pulso GPS',
      value: summary.latestLocationTimestamp ? formatDateTime(summary.latestLocationTimestamp) : 'Sin datos',
      description: 'Marca temporal del último evento de ubicación disponible.',
      tone: 'info',
    },
  ];
};

export const buildWatchList = (
  alerts: AlertResponse[],
  offlineCollars: CollarResponse[],
  cowsOutside: CowResponse[],
): DashboardWatchItem[] => {
  const alertItems: DashboardWatchItem[] = alerts.slice(0, 2).map((alert) => ({
    id: `alert-${alert.id}`,
    title: ALERT_TYPE_LABELS[alert.type],
    subtitle: alert.cowName ? `${alert.cowName} · ${alert.message}` : alert.message,
    meta: formatDateTime(alert.createdAt),
    tone: 'danger',
  }));

  const collarItems: DashboardWatchItem[] = offlineCollars.slice(0, 2).map((collar) => ({
    id: `collar-${collar.id}`,
    title: `Collar ${collar.token}`,
    subtitle: `${collar.cowName ?? 'Sin vaca asignada'} · ${collar.signalStatus ? SIGNAL_STATUS_LABELS[collar.signalStatus] : COLLAR_STATUS_LABELS[collar.status]}`,
    meta: collar.lastSeenAt ? `Última señal ${formatDateTime(collar.lastSeenAt)}` : 'Sin última señal registrada',
    tone: 'warning',
  }));

  const cowItems: DashboardWatchItem[] = cowsOutside.slice(0, 2).map((cow) => ({
    id: `cow-${cow.id}`,
    title: `Vaca ${cow.name}`,
    subtitle: `${cow.token} · ${COW_STATUS_LABELS[cow.status]}`,
    meta: cow.observations ?? 'Sin observaciones adicionales.',
    tone: 'danger',
  }));

  return [...alertItems, ...collarItems, ...cowItems].slice(0, 6);
};

export const buildRecentLocationFeed = (locations: LocationResponse[]): DashboardWatchItem[] => {
  return locations.slice(0, 5).map((location) => ({
    id: `loc-${location.id}`,
    title: location.cowName,
    subtitle: `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
    meta: `${location.insideGeofence ? 'Dentro de geocerca' : 'Fuera de geocerca'} · ${formatDateTime(location.recordedAt)}`,
    tone: location.insideGeofence ? 'success' : 'warning',
  }));
};
