import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Battery,
  BatteryCharging,
  ClipboardList,
  Eye,
  Filter,
  Pencil,
  Plus,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CollarService, CowService } from '@/api/services';
import { AppError } from '@/shared/errors/AppError';
import { PageContainer } from '@/layouts/components/PageContainer';
import { PageHeader } from '@/layouts/components/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { collarSchema, type CollarFormValues } from '@/utils/validations';
import {
  sanitizeSearchInput,
  sanitizeStrictInput,
  sanitizeTextInput,
} from '@/shared/utils/sanitize';
import type { CollarResponse, CowResponse, CollarStatus, DeviceSignalStatus } from '@/types';

type CollarStatusFilter = 'ALL' | 'ACTIVO' | 'INACTIVO' | 'MANTENIMIENTO';
type CollarMetricTone = 'info' | 'success' | 'warning' | 'danger';

interface CollarMetricItem {
  label: string;
  value: string | number;
  helper: string;
  tone: CollarMetricTone;
  icon: ReactNode;
}

const statusFilters: Array<{ label: string; value: CollarStatusFilter }> = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Activos', value: 'ACTIVO' },
  { label: 'Inactivos', value: 'INACTIVO' },
  { label: 'Mantenimiento', value: 'MANTENIMIENTO' },
];

const COLLAR_STATUS_LABELS: Record<CollarStatus, string> = {
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
  MANTENIMIENTO: 'Mantenimiento',
};

const SIGNAL_STATUS_LABELS: Record<DeviceSignalStatus, string> = {
  FUERTE: 'Señal fuerte',
  MEDIA: 'Señal media',
  DEBIL: 'Señal débil',
  SIN_SENAL: 'Sin señal',
};

const collarMetricToneLabels: Record<CollarMetricTone, string> = {
  info: 'Monitoreo',
  success: 'Operativo',
  warning: 'Revisión',
  danger: 'Crítico',
};

function getCollarStatusClass(status: CollarStatus) {
  if (status === 'ACTIVO') return 'collars-status-active';
  if (status === 'MANTENIMIENTO') return 'collars-status-maintenance';
  return 'collars-status-inactive';
}

function getSignalStatusClass(signalStatus: DeviceSignalStatus | null | undefined) {
  if (signalStatus === 'FUERTE') return 'collars-signal-strong';
  if (signalStatus === 'MEDIA') return 'collars-signal-medium';
  if (signalStatus === 'DEBIL') return 'collars-signal-weak';
  if (signalStatus === 'SIN_SENAL') return 'collars-signal-offline';
  return 'collars-signal-unknown';
}

function getBatteryClass(value: number | null | undefined) {
  if (value === null || value === undefined) return 'collars-battery-unknown';
  if (value < 20) return 'collars-battery-low';
  if (value < 50) return 'collars-battery-medium';
  return 'collars-battery-good';
}

function formatBattery(value: number | null | undefined) {
  if (value === null || value === undefined) return '—';
  return `${value}%`;
}

export function CollarsPage() {
  const [collars, setCollars] = useState<CollarResponse[]>([]);
  const [cows, setCows] = useState<CowResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CollarResponse | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CollarStatusFilter>('ALL');
  const [selectedCollarId, setSelectedCollarId] = useState<number | null>(null);

  const { hasAnyRole } = useAuthStore();

  const canWrite = hasAnyRole([
    'ADMINISTRADOR',
    'SUPERVISOR',
    'TECNICO',
    'OPERADOR',
  ]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CollarFormValues>({
    resolver: zodResolver(collarSchema),
    defaultValues: {
      status: 'ACTIVO',
      enabled: true,
      firmwareVersion: '',
      notes: '',
    },
  });

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [collarData, cowData] = await Promise.all([
        CollarService.getAll(),
        CowService.getAll(),
      ]);

      setCollars(collarData);
      setCows(cowData);

      if (
        collarData.length > 0 &&
        selectedCollarId &&
        !collarData.some((item) => item.id === selectedCollarId)
      ) {
        setSelectedCollarId(null);
      }
    } catch (err) {
      toast.error(AppError.from(err).serverMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedCollarId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return collars.filter((collar) => {
      const matchesSearch =
        collar.token.toLowerCase().includes(q) ||
        (collar.cowName?.toLowerCase().includes(q) ?? false) ||
        (collar.firmwareVersion?.toLowerCase().includes(q) ?? false);

      const matchesStatus =
        statusFilter === 'ALL' ? true : collar.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [collars, search, statusFilter]);

  const selectedCollar =
    selectedCollarId !== null
      ? filtered.find((collar) => collar.id === selectedCollarId) ??
        collars.find((collar) => collar.id === selectedCollarId) ??
        null
      : null;

  const openCreate = () => {
    setEditing(null);
    reset({
      status: 'ACTIVO',
      enabled: true,
      firmwareVersion: '',
      notes: '',
    });
    setServerError(null);
    setModalOpen(true);
  };

  const openEdit = (collar: CollarResponse) => {
    setEditing(collar);
    reset({
      status: collar.status as CollarFormValues['status'],
      cowId: collar.cowId ?? undefined,
      batteryLevel: collar.batteryLevel ?? undefined,
      firmwareVersion: collar.firmwareVersion ?? '',
      notes: collar.notes ?? '',
      enabled: collar.enabled,
    });
    setServerError(null);
    setModalOpen(true);
  };

  const onSubmit = async (values: CollarFormValues) => {
    setServerError(null);

    try {
      const payload = {
        status: values.status,
        cowId: values.cowId,
        batteryLevel: values.batteryLevel,
        firmwareVersion: values.firmwareVersion
          ? sanitizeStrictInput(values.firmwareVersion, 30)
          : undefined,
        notes: values.notes ? sanitizeTextInput(values.notes, 250) : undefined,
        enabled: values.enabled,
      };

      if (editing) {
        await CollarService.update(editing.id, payload);
        toast.success('Collar actualizado correctamente');
      } else {
        await CollarService.create(payload);
        toast.success('Collar registrado correctamente');
      }

      setModalOpen(false);
      void loadData();
    } catch (err) {
      setServerError(AppError.from(err).serverMessage);
    }
  };

  const activeCount = collars.filter((item) => item.status === 'ACTIVO').length;
  const maintenanceCount = collars.filter(
    (item) => item.status === 'MANTENIMIENTO',
  ).length;
  const offlineCount = collars.filter(
    (item) => item.signalStatus === 'SIN_SENAL' || !item.enabled,
  ).length;
  const lowBatteryCount = collars.filter(
    (item) =>
      item.batteryLevel !== null &&
      item.batteryLevel !== undefined &&
      item.batteryLevel < 20,
  ).length;

  const metrics: CollarMetricItem[] = [
    {
      label: 'Collares activos',
      value: activeCount,
      helper: 'Dispositivos disponibles para monitoreo GPS.',
      tone: 'success',
      icon: <ShieldCheck size={24} />,
    },
    {
      label: 'Sin señal',
      value: offlineCount,
      helper:
        offlineCount > 0
          ? 'Dispositivos sin conectividad o deshabilitados.'
          : 'Sin pérdida de señal registrada.',
      tone: offlineCount > 0 ? 'danger' : 'success',
      icon: <WifiOff size={24} />,
    },
    {
      label: 'Batería baja',
      value: lowBatteryCount,
      helper: 'Collares con batería menor al 20%.',
      tone: lowBatteryCount > 0 ? 'warning' : 'info',
      icon: <Battery size={24} />,
    },
    {
      label: 'Mantenimiento',
      value: maintenanceCount,
      helper: 'Dispositivos que requieren revisión técnica.',
      tone: maintenanceCount > 0 ? 'warning' : 'info',
      icon: <AlertCircle size={24} />,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Telemetría del hato"
        title="Collares"
        badge="Dispositivos GPS"
        subtitle="Controla disponibilidad, batería, señal y asignación de los collares del sistema ganadero."
        actions={
          canWrite ? (
            <Button size="sm" onClick={openCreate}>
              <Plus size={15} />
              Nuevo collar
            </Button>
          ) : undefined
        }
      />

      <PageContainer>
        <section className="collars-premium-hero card">
          <div className="collars-premium-hero-copy">
            <span className="collars-premium-eyebrow">
              <Sparkles size={14} />
              Telemetría GPS
            </span>

            <h2>Supervisión visual de collares, señal y batería del hato</h2>

            <p>
              Consulta el estado operativo de cada dispositivo, revisa asignaciones,
              niveles de batería, señal y disponibilidad sin alterar la conexión con backend.
            </p>

            <div className="collars-premium-pills">
              <span>
                <Radio size={14} />
                {collars.length} registrados
              </span>
              <span>
                <Wifi size={14} />
                {activeCount} activos
              </span>
              <span>
                <WifiOff size={14} />
                {offlineCount} sin señal
              </span>
            </div>
          </div>

          <div className="collars-premium-hero-card">
            <span>Collar seleccionado</span>
            <strong>{selectedCollar?.token ?? '—'}</strong>
            <small>
              {selectedCollar
                ? selectedCollar.cowName ?? 'Sin vaca asignada'
                : 'Selecciona una fila para ver el detalle rápido.'}
            </small>
          </div>
        </section>

        <section className="collars-premium-metrics">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className={`collars-premium-metric collars-premium-metric-${metric.tone}`}
            >
              <div className="collars-premium-metric-top">
                <div className="collars-premium-metric-icon">{metric.icon}</div>

                <span className="collars-premium-metric-status">
                  <Sparkles size={13} />
                  {collarMetricToneLabels[metric.tone]}
                </span>
              </div>

              <div className="collars-premium-metric-copy">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <p>{metric.helper}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="card collars-premium-toolbar">
          <div className="collars-premium-toolbar-main">
            <div className="collars-premium-toolbar-title">
              <Search size={18} />

              <div>
                <strong>Búsqueda de dispositivos</strong>
                <span>Filtra por token, vaca asignada o versión de firmware.</span>
              </div>
            </div>

            <div className="collars-premium-search-box">
              <Search size={15} className="search-icon" />
              <input
                className="search-input collars-premium-search"
                placeholder="Buscar por token, vaca o firmware..."
                value={search}
                maxLength={60}
                onChange={(e) =>
                  setSearch(sanitizeSearchInput(e.target.value, 60))
                }
              />
            </div>
          </div>

          <div className="collars-premium-toolbar-note">
            Mostrando {filtered.length} de {collars.length} collares registrados
          </div>
        </section>

        <section className="card collars-premium-filters-panel">
          <div className="card-header collars-premium-section-header">
            <div>
              <span className="card-title">
                <Filter size={16} />
                Filtros rápidos
              </span>
              <p className="collars-premium-section-subtitle">
                Cambia la vista según el estado operativo del dispositivo.
              </p>
            </div>
          </div>

          <div className="card-body">
            <div className="collars-premium-filter-chips">
              {statusFilters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`collars-premium-filter-chip ${
                    statusFilter === item.value ? 'active' : ''
                  }`}
                  onClick={() => setStatusFilter(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {selectedCollar ? (
          <section className="card collars-premium-detail-panel">
            <div className="card-header collars-premium-section-header">
              <div>
                <span className="card-title">
                  <Eye size={16} />
                  Detalle rápido
                </span>
                <p className="collars-premium-section-subtitle">
                  Resumen visual del dispositivo seleccionado.
                </p>
              </div>

              <span
                className={`collars-status-chip ${getCollarStatusClass(
                  selectedCollar.status,
                )}`}
              >
                {COLLAR_STATUS_LABELS[selectedCollar.status]}
              </span>
            </div>

            <div className="card-body">
              <div className="collars-premium-detail-grid">
                <div className="collars-premium-detail-item">
                  <span>Token</span>
                  <strong>{selectedCollar.token}</strong>
                </div>

                <div className="collars-premium-detail-item">
                  <span>Vaca asignada</span>
                  <strong>{selectedCollar.cowName ?? 'Sin asignar'}</strong>
                </div>

                <div className="collars-premium-detail-item">
                  <span>Batería</span>
                  <strong>{formatBattery(selectedCollar.batteryLevel)}</strong>
                </div>

                <div className="collars-premium-detail-item">
                  <span>Señal</span>
                  <strong>
                    {selectedCollar.signalStatus
                      ? SIGNAL_STATUS_LABELS[selectedCollar.signalStatus]
                      : 'Sin dato'}
                  </strong>
                </div>

                <div className="collars-premium-detail-item">
                  <span>Firmware</span>
                  <strong>{selectedCollar.firmwareVersion ?? '—'}</strong>
                </div>

                <div className="collars-premium-detail-item">
                  <span>Habilitado</span>
                  <strong>{selectedCollar.enabled ? 'Sí' : 'No'}</strong>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {loading ? (
          <div className="loading-center">
            <div className="loading-spinner" />
          </div>
        ) : (
          <section className="card collars-premium-table-panel">
            <div className="card-header collars-premium-section-header">
              <div>
                <span className="card-title">
                  <ClipboardList size={16} />
                  Inventario de collares
                </span>
                <p className="collars-premium-section-subtitle">
                  Listado de dispositivos GPS, estado, señal, batería y asignación.
                </p>
              </div>

              <span className="collars-premium-table-badge">
                {filtered.length} registros
              </span>
            </div>

            <div className="card-body">
              <div className="collars-premium-table-shell">
                <table>
                  <thead>
                    <tr>
                      <th>Token</th>
                      <th>Estado</th>
                      <th>Vaca</th>
                      <th>Batería</th>
                      <th>Señal</th>
                      <th>Firmware</th>
                      <th>Habilitado</th>
                      {canWrite ? <th style={{ width: 90 }}>Editar</th> : null}
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={canWrite ? 8 : 7}>
                          <div className="empty-state">
                            <Radio size={32} className="empty-state-icon" />
                            <span className="empty-state-text">
                              No se encontraron collares con el filtro actual.
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((collar) => (
                        <tr
                          key={collar.id}
                          className={
                            selectedCollarId === collar.id
                              ? 'collars-row-selected'
                              : ''
                          }
                          onClick={() => setSelectedCollarId(collar.id)}
                        >
                          <td>
                            <span className="collars-token-chip">
                              <Radio size={13} />
                              {collar.token}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`collars-status-chip ${getCollarStatusClass(
                                collar.status,
                              )}`}
                            >
                              {COLLAR_STATUS_LABELS[collar.status]}
                            </span>
                          </td>

                          <td>
                            <span className="collars-cow-chip">
                              {collar.cowName ?? 'Sin asignar'}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`collars-battery-chip ${getBatteryClass(
                                collar.batteryLevel,
                              )}`}
                            >
                              <BatteryCharging size={13} />
                              {formatBattery(collar.batteryLevel)}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`collars-signal-chip ${getSignalStatusClass(
                                collar.signalStatus,
                              )}`}
                            >
                              {collar.signalStatus === 'SIN_SENAL' ? (
                                <WifiOff size={13} />
                              ) : (
                                <Wifi size={13} />
                              )}
                              {collar.signalStatus
                                ? SIGNAL_STATUS_LABELS[collar.signalStatus]
                                : 'Sin dato'}
                            </span>
                          </td>

                          <td className="td-mono">
                            {collar.firmwareVersion ?? '—'}
                          </td>

                          <td>
                            <span
                              className={`collars-enabled-chip ${
                                collar.enabled
                                  ? 'collars-enabled-yes'
                                  : 'collars-enabled-no'
                              }`}
                            >
                              {collar.enabled ? 'Sí' : 'No'}
                            </span>
                          </td>

                          {canWrite ? (
                            <td>
                              <button
                                className="btn btn-ghost btn-icon btn-sm collars-edit-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEdit(collar);
                                }}
                                title="Editar collar"
                              >
                                <Pencil size={14} />
                              </button>
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
        )}
      </PageContainer>

      {modalOpen ? (
        <div
          className="modal-backdrop collars-premium-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="modal collars-premium-modal">
            <div className="modal-header">
              <span className="modal-title">
                {editing ? 'Editar collar' : 'Registrar collar'}
              </span>

              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="modal-body">
                <div className="collars-premium-modal-summary">
                  <div className="collars-premium-modal-icon">
                    <Radio size={22} />
                  </div>

                  <div>
                    <strong>{editing ? editing.token : 'Nuevo collar GPS'}</strong>
                    <span>
                      {editing
                        ? editing.cowName ?? 'Sin vaca asignada'
                        : 'El token será gestionado automáticamente.'}
                    </span>
                  </div>
                </div>

                {serverError ? (
                  <div className="alert-banner error" style={{ marginBottom: 16 }}>
                    <AlertCircle
                      size={14}
                      style={{ display: 'inline', marginRight: 6 }}
                    />
                    {serverError}
                  </div>
                ) : null}

                <div className="form-grid">
                  {editing ? (
                    <div className="form-group">
                      <label className="form-label">Token generado</label>
                      <input
                        className="form-input"
                        value={editing.token}
                        readOnly
                        disabled
                      />
                      <span className="collars-premium-helper-text">
                        El token lo genera el backend y no se puede editar.
                      </span>
                    </div>
                  ) : null}

                  <div className="form-group">
                    <label className="form-label">Estado *</label>
                    <select
                      className={`form-select ${errors.status ? 'error' : ''}`}
                      {...register('status')}
                    >
                      <option value="ACTIVO">Activo</option>
                      <option value="INACTIVO">Inactivo</option>
                      <option value="MANTENIMIENTO">Mantenimiento</option>
                    </select>

                    {errors.status ? (
                      <span className="form-error">
                        <AlertCircle size={11} />
                        {errors.status.message}
                      </span>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Vaca asignada</label>
                    <select
                      className="form-select"
                      {...register('cowId', {
                        setValueAs: (value) =>
                          value === '' ? undefined : Number(value),
                      })}
                    >
                      <option value="">Sin asignar</option>
                      {cows.map((cow) => (
                        <option key={cow.id} value={cow.id}>
                          {cow.name} ({cow.token})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nivel de batería (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className={`form-input ${
                        errors.batteryLevel ? 'error' : ''
                      }`}
                      placeholder="0-100"
                      {...register('batteryLevel', {
                        setValueAs: (value) =>
                          value === '' ? undefined : Number(value),
                      })}
                    />

                    {errors.batteryLevel ? (
                      <span className="form-error">
                        <AlertCircle size={11} />
                        {errors.batteryLevel.message}
                      </span>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Firmware</label>
                    <input
                      className="form-input"
                      placeholder="ej. v1.2.3"
                      maxLength={30}
                      {...register('firmwareVersion', {
                        setValueAs: (value) =>
                          sanitizeStrictInput(value ?? '', 30),
                      })}
                    />
                  </div>

                  <div className="form-group" style={{ alignSelf: 'end' }}>
                    <label className="collars-premium-checkbox">
                      <input type="checkbox" {...register('enabled')} />
                      <span>Collar habilitado</span>
                    </label>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: 14 }}>
                  <label className="form-label">Notas</label>
                  <textarea
                    className={`form-textarea ${errors.notes ? 'error' : ''}`}
                    placeholder="Observaciones técnicas..."
                    maxLength={250}
                    {...register('notes', {
                      setValueAs: (value) =>
                        sanitizeTextInput(value ?? '', 250),
                    })}
                  />

                  {errors.notes ? (
                    <span className="form-error">
                      <AlertCircle size={11} />
                      {errors.notes.message}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="loading-spinner"
                        style={{ width: 14, height: 14, borderWidth: 2 }}
                      />
                      Guardando...
                    </>
                  ) : editing ? (
                    'Guardar cambios'
                  ) : (
                    'Registrar collar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}