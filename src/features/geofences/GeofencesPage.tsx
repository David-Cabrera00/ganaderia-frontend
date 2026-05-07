import { useEffect, useMemo, useState, useCallback, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ClipboardList,
  Crosshair,
  Eye,
  Filter,
  MapPin,
  Plus,
  Radar,
  Ruler,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CattleIcon } from '@/shared/components/ui/CattleIcon';
import { GeofenceService, CowService } from '@/api/services';
import { AppError } from '@/shared/errors/AppError';
import { geofenceSchema, type GeofenceFormValues } from '@/utils/validations';
import { sanitizeSearchInput, sanitizeTextInput } from '@/shared/utils/sanitize';
import type { GeofenceResponse, CowResponse } from '@/types';
import { PageContainer } from '@/layouts/components/PageContainer';
import { PageHeader } from '@/layouts/components/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { GeofencesMap } from '@/features/geofences/components/GeofencesMap';

type GeofenceStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'ASSIGNED' | 'UNASSIGNED';
type GeofenceMetricTone = 'info' | 'success' | 'warning' | 'danger';

interface GeofenceMetricItem {
  label: string;
  value: string | number;
  helper: string;
  tone: GeofenceMetricTone;
  icon: ReactNode;
}

const statusFilters: Array<{ label: string; value: GeofenceStatusFilter }> = [
  { label: 'Todas', value: 'ALL' },
  { label: 'Activas', value: 'ACTIVE' },
  { label: 'Inactivas', value: 'INACTIVE' },
  { label: 'Asignadas', value: 'ASSIGNED' },
  { label: 'Sin asignar', value: 'UNASSIGNED' },
];

const geofenceMetricToneLabels: Record<GeofenceMetricTone, string> = {
  info: 'Territorio',
  success: 'Activa',
  warning: 'Revisión',
  danger: 'Inactiva',
};

function getGeofenceStatusClass(active: boolean) {
  return active ? 'geofences-status-active' : 'geofences-status-inactive';
}

function getAssignmentClass(cowId: number | null) {
  return cowId ? 'geofences-assigned' : 'geofences-unassigned';
}

export function GeofencesPage() {
  const [geofences, setGeofences] = useState<GeofenceResponse[]>([]);
  const [cows, setCows] = useState<CowResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<GeofenceStatusFilter>('ALL');
  const [selectedGeofenceId, setSelectedGeofenceId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GeofenceFormValues>({
    resolver: zodResolver(geofenceSchema),
    defaultValues: {
      active: true,
    },
  });

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const [geofencesData, cowsData] = await Promise.all([
        GeofenceService.getAll(),
        CowService.getAll(),
      ]);

      setGeofences(geofencesData);
      setCows(cowsData);

      if (
        selectedGeofenceId &&
        !geofencesData.some((item) => item.id === selectedGeofenceId)
      ) {
        setSelectedGeofenceId(null);
      }
    } catch (err) {
      toast.error(AppError.from(err).serverMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedGeofenceId]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return geofences.filter((geofence) => {
      const matchesSearch =
        geofence.name.toLowerCase().includes(q) ||
        (geofence.cowName?.toLowerCase().includes(q) ?? false) ||
        (geofence.cowToken?.toLowerCase().includes(q) ?? false);

      const matchesFilter =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'ACTIVE'
          ? geofence.active
          : statusFilter === 'INACTIVE'
          ? !geofence.active
          : statusFilter === 'ASSIGNED'
          ? geofence.cowId !== null
          : geofence.cowId === null;

      return matchesSearch && matchesFilter;
    });
  }, [geofences, search, statusFilter]);

  useEffect(() => {
    if (
      selectedGeofenceId &&
      !filtered.some((item) => item.id === selectedGeofenceId)
    ) {
      setSelectedGeofenceId(null);
    }
  }, [filtered, selectedGeofenceId]);

  const selectedGeofence =
    selectedGeofenceId !== null
      ? filtered.find((item) => item.id === selectedGeofenceId) ??
        geofences.find((item) => item.id === selectedGeofenceId) ??
        null
      : null;

  const openCreate = () => {
    reset({
      name: '',
      centerLatitude: undefined,
      centerLongitude: undefined,
      radiusMeters: undefined,
      cowId: undefined,
      active: true,
    });
    setServerError(null);
    setModalOpen(true);
  };

  const onSubmit = async (values: GeofenceFormValues) => {
    setServerError(null);

    try {
      await GeofenceService.create({
        name: sanitizeTextInput(values.name, 80),
        centerLatitude: values.centerLatitude,
        centerLongitude: values.centerLongitude,
        radiusMeters: values.radiusMeters,
        active: values.active,
        cowId: values.cowId,
      });

      toast.success('Geocerca creada correctamente');
      setModalOpen(false);
      void load();
    } catch (err) {
      setServerError(AppError.from(err).serverMessage);
    }
  };

  const activeCount = geofences.filter((geofence) => geofence.active).length;
  const inactiveCount = geofences.length - activeCount;
  const assignedCount = geofences.filter((geofence) => geofence.cowId !== null).length;
  const averageRadius =
    geofences.length > 0
      ? Math.round(
          geofences.reduce((sum, geofence) => sum + geofence.radiusMeters, 0) /
            geofences.length,
        )
      : 0;

  const metrics: GeofenceMetricItem[] = [
    {
      label: 'Geocercas totales',
      value: geofences.length,
      helper: 'Perímetros configurados en el sistema.',
      tone: 'info',
      icon: <MapPin size={24} />,
    },
    {
      label: 'Activas',
      value: activeCount,
      helper: 'Zonas listas para seguimiento territorial.',
      tone: 'success',
      icon: <ShieldCheck size={24} />,
    },
    {
      label: 'Asignadas',
      value: assignedCount,
      helper: 'Perímetros vinculados a animales.',
      tone: 'warning',
      icon: <CattleIcon width={24} height={24} />,
    },
    {
      label: 'Radio promedio',
      value: `${averageRadius} m`,
      helper: 'Promedio de cobertura configurada.',
      tone: inactiveCount > 0 ? 'warning' : 'info',
      icon: <Ruler size={24} />,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Perímetros inteligentes"
        title="Geocercas"
        badge="Control territorial"
        subtitle="Configura radios, centros geográficos y asignaciones para dejar listo el monitoreo de campo antes del despliegue real."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus size={15} />
            Nueva geocerca
          </Button>
        }
      />

      <PageContainer>
        <section className="geofences-premium-hero card">
          <div className="geofences-premium-hero-copy">
            <span className="geofences-premium-eyebrow">
              <Sparkles size={14} />
              Control territorial
            </span>

            <h2>Gestión visual de perímetros y zonas de monitoreo ganadero</h2>

            <p>
              Administra las zonas de control, revisa radios de cobertura, centros
              geográficos y asignaciones del hato en un panel territorial unificado.
            </p>

            <div className="geofences-premium-pills">
              <span>
                <Radar size={14} />
                {geofences.length} perímetros
              </span>
              <span>
                <ShieldCheck size={14} />
                {activeCount} activas
              </span>
              <span>
                <CattleIcon width={14} height={14} />
                {assignedCount} asignadas
              </span>
            </div>
          </div>

          <div className="geofences-premium-hero-card">
            <span>Geocerca seleccionada</span>
            <strong>{selectedGeofence?.name ?? '—'}</strong>
            <small>
              {selectedGeofence
                ? selectedGeofence.cowName ?? 'Sin vaca asignada'
                : 'Selecciona una zona para ver el detalle rápido.'}
            </small>
          </div>
        </section>

        <section className="geofences-premium-metrics">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className={`geofences-premium-metric geofences-premium-metric-${metric.tone}`}
            >
              <div className="geofences-premium-metric-top">
                <div className="geofences-premium-metric-icon">{metric.icon}</div>

                <span className="geofences-premium-metric-status">
                  <Sparkles size={13} />
                  {geofenceMetricToneLabels[metric.tone]}
                </span>
              </div>

              <div className="geofences-premium-metric-copy">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <p>{metric.helper}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="card geofences-premium-toolbar">
          <div className="geofences-premium-toolbar-main">
            <div className="geofences-premium-toolbar-title">
              <Search size={18} />

              <div>
                <strong>Búsqueda territorial</strong>
                <span>Filtra por nombre de geocerca, vaca asignada o token.</span>
              </div>
            </div>

            <div className="geofences-premium-search-box">
              <Search size={15} className="search-icon" />
              <input
                className="search-input geofences-premium-search"
                placeholder="Buscar geocerca, vaca o token..."
                value={search}
                maxLength={60}
                onChange={(event) =>
                  setSearch(sanitizeSearchInput(event.target.value, 60))
                }
              />
            </div>
          </div>

          <div className="geofences-premium-toolbar-note">
            Mostrando {filtered.length} de {geofences.length} zonas configuradas
          </div>
        </section>

        <section className="card geofences-premium-filters-panel">
          <div className="card-header geofences-premium-section-header">
            <div>
              <span className="card-title">
                <Filter size={16} />
                Filtros rápidos
              </span>
              <p className="geofences-premium-section-subtitle">
                Cambia la vista según estado de la zona o asignación.
              </p>
            </div>
          </div>

          <div className="card-body">
            <div className="geofences-premium-filter-chips">
              {statusFilters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`geofences-premium-filter-chip ${
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

        <section className="card geofences-premium-selection-panel">
          <div className="card-header geofences-premium-section-header">
            <div>
              <span className="card-title">
                <Crosshair size={16} />
                Selección rápida
              </span>
              <p className="geofences-premium-section-subtitle">
                Enfoca una geocerca en el mapa y en la tabla.
              </p>
            </div>
          </div>

          <div className="card-body">
            <div className="geofences-premium-selection-chips">
              <button
                type="button"
                className={`geofences-premium-selection-chip ${
                  selectedGeofenceId === null ? 'active' : ''
                }`}
                onClick={() => setSelectedGeofenceId(null)}
              >
                Ver todas
              </button>

              {filtered.map((geofence) => (
                <button
                  key={geofence.id}
                  type="button"
                  className={`geofences-premium-selection-chip ${
                    selectedGeofenceId === geofence.id ? 'active' : ''
                  }`}
                  onClick={() => setSelectedGeofenceId(geofence.id)}
                >
                  {geofence.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {selectedGeofence ? (
          <section className="card geofences-premium-detail-panel">
            <div className="card-header geofences-premium-section-header">
              <div>
                <span className="card-title">
                  <Eye size={16} />
                  Detalle rápido
                </span>
                <p className="geofences-premium-section-subtitle">
                  Resumen visual de la zona seleccionada.
                </p>
              </div>

              <span
                className={`geofences-status-chip ${getGeofenceStatusClass(
                  selectedGeofence.active,
                )}`}
              >
                {selectedGeofence.active ? 'Activa' : 'Inactiva'}
              </span>
            </div>

            <div className="card-body">
              <div className="geofences-premium-detail-grid">
                <div className="geofences-premium-detail-item">
                  <span>Nombre</span>
                  <strong>{selectedGeofence.name}</strong>
                </div>

                <div className="geofences-premium-detail-item">
                  <span>Radio</span>
                  <strong>{selectedGeofence.radiusMeters} m</strong>
                </div>

                <div className="geofences-premium-detail-item">
                  <span>Centro</span>
                  <strong>
                    {selectedGeofence.centerLatitude.toFixed(4)},{' '}
                    {selectedGeofence.centerLongitude.toFixed(4)}
                  </strong>
                </div>

                <div className="geofences-premium-detail-item">
                  <span>Vaca asignada</span>
                  <strong>{selectedGeofence.cowName ?? 'Sin asignar'}</strong>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <div className="geofences-premium-map-area">
          <GeofencesMap
            geofences={filtered}
            selectedGeofenceId={selectedGeofenceId}
            onSelect={setSelectedGeofenceId}
          />
        </div>

        {loading ? (
          <div className="loading-center">
            <div className="loading-spinner" />
          </div>
        ) : (
          <section className="card geofences-premium-table-panel">
            <div className="card-header geofences-premium-section-header">
              <div>
                <span className="card-title">
                  <ClipboardList size={16} />
                  Perímetros configurados
                </span>
                <p className="geofences-premium-section-subtitle">
                  Listado de geocercas, radios, estado y asignación actual.
                </p>
              </div>

              <span className="geofences-premium-table-badge">
                {filtered.length} registros
              </span>
            </div>

            <div className="card-body">
              <div className="geofences-premium-table-shell">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Latitud centro</th>
                      <th>Longitud centro</th>
                      <th>Radio</th>
                      <th>Vaca asignada</th>
                      <th>Estado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6}>
                          <div className="empty-state">
                            <MapPin size={32} className="empty-state-icon" />
                            <span className="empty-state-text">
                              No hay geocercas que coincidan con el filtro actual.
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((geofence) => (
                        <tr
                          key={geofence.id}
                          className={
                            selectedGeofenceId === geofence.id
                              ? 'geofences-row-selected'
                              : ''
                          }
                          onClick={() => setSelectedGeofenceId(geofence.id)}
                        >
                          <td>
                            <div className="geofences-name-cell">
                              <div className="geofences-name-icon">
                                <MapPin size={16} />
                              </div>

                              <strong>{geofence.name}</strong>
                            </div>
                          </td>

                          <td className="td-mono">
                            {geofence.centerLatitude.toFixed(6)}
                          </td>

                          <td className="td-mono">
                            {geofence.centerLongitude.toFixed(6)}
                          </td>

                          <td>
                            <span className="geofences-radius-chip">
                              <Ruler size={13} />
                              {geofence.radiusMeters} m
                            </span>
                          </td>

                          <td>
                            <span
                              className={`geofences-assignment-chip ${getAssignmentClass(
                                geofence.cowId,
                              )}`}
                            >
                              {geofence.cowName ?? 'Sin asignar'}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`geofences-status-chip ${getGeofenceStatusClass(
                                geofence.active,
                              )}`}
                            >
                              {geofence.active ? 'Activa' : 'Inactiva'}
                            </span>
                          </td>
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
          className="modal-backdrop geofences-premium-modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) setModalOpen(false);
          }}
        >
          <div className="modal geofences-premium-modal">
            <div className="modal-header">
              <span className="modal-title">Nueva geocerca</span>

              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setModalOpen(false)}
                type="button"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="modal-body">
                <div className="geofences-premium-modal-summary">
                  <div className="geofences-premium-modal-icon">
                    <MapPin size={22} />
                  </div>

                  <div>
                    <strong>Nuevo perímetro territorial</strong>
                    <span>
                      Define centro, radio, estado y asignación opcional.
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
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Nombre *</label>
                    <input
                      className={`form-input ${errors.name ? 'error' : ''}`}
                      placeholder="ej. Potrero Norte"
                      maxLength={80}
                      {...register('name', {
                        setValueAs: (value) =>
                          sanitizeTextInput(value ?? '', 80),
                      })}
                    />

                    {errors.name ? (
                      <span className="form-error">
                        <AlertCircle size={11} />
                        {errors.name.message}
                      </span>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Latitud centro *</label>
                    <input
                      type="number"
                      step="any"
                      className={`form-input ${
                        errors.centerLatitude ? 'error' : ''
                      }`}
                      placeholder="1.213600"
                      {...register('centerLatitude', {
                        setValueAs: (value) =>
                          value === '' ? undefined : Number(value),
                      })}
                    />

                    {errors.centerLatitude ? (
                      <span className="form-error">
                        <AlertCircle size={11} />
                        {errors.centerLatitude.message}
                      </span>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Longitud centro *</label>
                    <input
                      type="number"
                      step="any"
                      className={`form-input ${
                        errors.centerLongitude ? 'error' : ''
                      }`}
                      placeholder="-77.281100"
                      {...register('centerLongitude', {
                        setValueAs: (value) =>
                          value === '' ? undefined : Number(value),
                      })}
                    />

                    {errors.centerLongitude ? (
                      <span className="form-error">
                        <AlertCircle size={11} />
                        {errors.centerLongitude.message}
                      </span>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Radio (m) *</label>
                    <input
                      type="number"
                      min={1}
                      className={`form-input ${
                        errors.radiusMeters ? 'error' : ''
                      }`}
                      placeholder="500"
                      {...register('radiusMeters', {
                        setValueAs: (value) =>
                          value === '' ? undefined : Number(value),
                      })}
                    />

                    {errors.radiusMeters ? (
                      <span className="form-error">
                        <AlertCircle size={11} />
                        {errors.radiusMeters.message}
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

                  <div className="form-group" style={{ alignSelf: 'end' }}>
                    <label className="geofences-premium-checkbox">
                      <input type="checkbox" defaultChecked {...register('active')} />
                      <span>Geocerca activa</span>
                    </label>
                  </div>
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
                  ) : (
                    'Crear geocerca'
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