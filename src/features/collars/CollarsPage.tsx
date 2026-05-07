import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Battery,
  Filter,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  WifiOff,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CollarService, CowService } from '@/api/services';
import { AppError } from '@/shared/errors/AppError';
import { PageContainer } from '@/layouts/components/PageContainer';
import { PageHeader } from '@/layouts/components/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { MetricCard } from '@/shared/components/ui/MetricCard';
import { useAuthStore } from '@/stores/authStore';
import { collarSchema, type CollarFormValues } from '@/utils/validations';
import {
  sanitizeSearchInput,
  sanitizeStrictInput,
  sanitizeTextInput,
} from '@/shared/utils/sanitize';
import type { CollarResponse, CowResponse } from '@/types';

type CollarStatusFilter = 'ALL' | 'ACTIVO' | 'INACTIVO' | 'MANTENIMIENTO';

const COLLAR_STATUS_LABELS: Record<string, string> = {
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
  MANTENIMIENTO: 'Mantenimiento',
};

const COLLAR_STATUS_COLORS: Record<string, string> = {
  ACTIVO: 'success',
  INACTIVO: 'neutral',
  MANTENIMIENTO: 'warning',
};

const SIGNAL_STATUS_LABELS: Record<string, string> = {
  FUERTE: 'Señal fuerte',
  DEBIL: 'Señal débil',
  SIN_SENAL: 'Sin señal',
};

const SIGNAL_STATUS_COLORS: Record<string, string> = {
  FUERTE: 'success',
  DEBIL: 'warning',
  SIN_SENAL: 'danger',
};

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
        (collar.cowToken?.toLowerCase().includes(q) ?? false) ||
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
        notes: values.notes
          ? sanitizeTextInput(values.notes, 250)
          : undefined,
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

  return (
    <>
      <PageHeader
        eyebrow="Telemetría del hato"
        title="Collares"
        badge="Dispositivos GPS"
        subtitle="Controla la disponibilidad, batería, señal y asignación de collares sobre los animales registrados."
        actions={
          canWrite ? (
            <Button size="sm" onClick={openCreate}>
              <Plus size={15} /> Nuevo collar
            </Button>
          ) : undefined
        }
      />

      <PageContainer>
        <section className="overview-grid">
          <MetricCard
            icon={<ShieldCheck size={20} />}
            label="Activos"
            value={activeCount}
            helper="Collares operativos"
            tone="success"
          />
          <MetricCard
            icon={<WifiOff size={20} />}
            label="Sin señal"
            value={offlineCount}
            helper="Dispositivos sin conectividad"
            tone={offlineCount > 0 ? 'danger' : 'info'}
          />
          <MetricCard
            icon={<Battery size={20} />}
            label="Batería baja"
            value={lowBatteryCount}
            helper="Menor a 20%"
            tone={lowBatteryCount > 0 ? 'warning' : 'info'}
          />
          <MetricCard
            icon={<AlertCircle size={20} />}
            label="Mantenimiento"
            value={maintenanceCount}
            helper="Requieren revisión técnica"
            tone={maintenanceCount > 0 ? 'warning' : 'neutral'}
          />
        </section>

        <div className="toolbar toolbar-panel">
          <div className="toolbar-left">
            <div className="search-input-wrapper">
              <Search size={15} className="search-icon" />
              <input
                className="search-input"
                placeholder="Buscar por token, vaca o firmware..."
                value={search}
                maxLength={60}
                onChange={(e) =>
                  setSearch(sanitizeSearchInput(e.target.value, 60))
                }
              />
            </div>
          </div>

          <span className="page-summary-note">
            Mostrando {filtered.length} de {collars.length} registros
          </span>
        </div>

        <section className="card" style={{ marginTop: 16 }}>
          <div className="card-header">
            <span className="card-title">
              <Filter size={16} /> Filtros rápidos
            </span>
          </div>

          <div
            className="card-body"
            style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}
          >
            {[
              { label: 'Todos', value: 'ALL' as const },
              { label: 'Activos', value: 'ACTIVO' as const },
              { label: 'Inactivos', value: 'INACTIVO' as const },
              { label: 'Mantenimiento', value: 'MANTENIMIENTO' as const },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                className="btn btn-secondary btn-sm"
                style={
                  statusFilter === item.value
                    ? {
                        background: 'var(--accent-dim)',
                        borderColor: 'var(--accent)',
                        color: 'var(--accent)',
                      }
                    : undefined
                }
                onClick={() => setStatusFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {selectedCollar ? (
          <section className="card" style={{ marginTop: 16 }}>
            <div className="card-header">
              <span className="card-title">Detalle rápido</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span
                  className={`badge ${
                    COLLAR_STATUS_COLORS[selectedCollar.status] ?? 'neutral'
                  }`}
                >
                  {COLLAR_STATUS_LABELS[selectedCollar.status] ??
                    selectedCollar.status}
                </span>
                {selectedCollar.signalStatus ? (
                  <span
                    className={`badge ${
                      SIGNAL_STATUS_COLORS[selectedCollar.signalStatus] ??
                      'neutral'
                    }`}
                  >
                    {SIGNAL_STATUS_LABELS[selectedCollar.signalStatus] ??
                      selectedCollar.signalStatus}
                  </span>
                ) : null}
              </div>
            </div>

            <div
              className="card-body"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: 16,
              }}
            >
              <div>
                <div className="report-summary-label">Token</div>
                <strong>{selectedCollar.token}</strong>
              </div>
              <div>
                <div className="report-summary-label">Vaca asignada</div>
                <strong>{selectedCollar.cowName ?? 'Sin asignar'}</strong>
              </div>
              <div>
                <div className="report-summary-label">Batería</div>
                <strong>
                  {selectedCollar.batteryLevel !== null &&
                  selectedCollar.batteryLevel !== undefined
                    ? `${selectedCollar.batteryLevel}%`
                    : '—'}
                </strong>
              </div>
              <div>
                <div className="report-summary-label">Firmware</div>
                <strong>{selectedCollar.firmwareVersion ?? '—'}</strong>
              </div>
            </div>
          </section>
        ) : null}

        {loading ? (
          <div className="loading-center">
            <div className="loading-spinner" />
          </div>
        ) : (
          <div className="table-wrapper" style={{ marginTop: 16 }}>
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
                  {canWrite ? <th style={{ width: 60 }}>Editar</th> : null}
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={canWrite ? 8 : 7}>
                      <div className="empty-state">
                        <WifiOff size={32} className="empty-state-icon" />
                        <span className="empty-state-text">
                          No se encontraron collares con el filtro actual
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((collar) => (
                    <tr
                      key={collar.id}
                      onClick={() => setSelectedCollarId(collar.id)}
                      style={{
                        cursor: 'pointer',
                        background:
                          selectedCollarId === collar.id
                            ? 'var(--accent-dim)'
                            : undefined,
                      }}
                    >
                      <td className="td-mono">{collar.token}</td>
                      <td>
                        <span
                          className={`badge ${
                            COLLAR_STATUS_COLORS[collar.status] ?? 'neutral'
                          }`}
                        >
                          {COLLAR_STATUS_LABELS[collar.status] ?? collar.status}
                        </span>
                      </td>
                      <td>{collar.cowName ?? 'Sin asignar'}</td>
                      <td>
                        {collar.batteryLevel !== null &&
                        collar.batteryLevel !== undefined
                          ? `${collar.batteryLevel}%`
                          : '—'}
                      </td>
                      <td>
                        {collar.signalStatus ? (
                          <span
                            className={`badge ${
                              SIGNAL_STATUS_COLORS[collar.signalStatus] ??
                              'neutral'
                            }`}
                          >
                            {SIGNAL_STATUS_LABELS[collar.signalStatus] ??
                              collar.signalStatus}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{collar.firmwareVersion ?? '—'}</td>
                      <td>{collar.enabled ? 'Sí' : 'No'}</td>
                      {canWrite ? (
                        <td>
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
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
        )}
      </PageContainer>

      {modalOpen ? (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="modal">
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
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                        }}
                      >
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
                        <AlertCircle size={11} /> {errors.status.message}
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
                        <AlertCircle size={11} /> {errors.batteryLevel.message}
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
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        {...register('enabled')}
                        style={{
                          width: 16,
                          height: 16,
                          accentColor: 'var(--accent)',
                        }}
                      />
                      <span className="form-label" style={{ margin: 0 }}>
                        Collar habilitado
                      </span>
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
                      <AlertCircle size={11} /> {errors.notes.message}
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
                      />{' '}
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