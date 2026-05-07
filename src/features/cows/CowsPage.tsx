import { useEffect, useMemo, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ClipboardList,
  Eye,
  Filter,
  Hash,
  MapPin,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CattleIcon } from '@/shared/components/ui/CattleIcon';
import { CowService } from '@/api/services';
import { AppError } from '@/shared/errors/AppError';
import { useAuthStore } from '@/stores/authStore';
import { cowSchema, type CowFormValues } from '@/utils/validations';
import { COW_STATUS_LABELS } from '@/utils/helpers';
import {
  sanitizeSearchInput,
  sanitizeStrictInput,
  sanitizeTextInput,
} from '@/shared/utils/sanitize';
import type { CowResponse } from '@/types';
import { PageContainer } from '@/layouts/components/PageContainer';
import { PageHeader } from '@/layouts/components/PageHeader';
import { Button } from '@/shared/components/ui/Button';

type CowStatusFilter = 'ALL' | 'DENTRO' | 'FUERA' | 'SIN_UBICACION';
type CowMetricTone = 'info' | 'success' | 'warning' | 'danger';

interface CowMetricItem {
  label: string;
  value: string | number;
  helper: string;
  tone: CowMetricTone;
  icon: JSX.Element;
}

const statusFilters: Array<{ label: string; value: CowStatusFilter }> = [
  { label: 'Todas', value: 'ALL' },
  { label: 'Dentro', value: 'DENTRO' },
  { label: 'Fuera', value: 'FUERA' },
  { label: 'Sin ubicación', value: 'SIN_UBICACION' },
];

const cowMetricToneLabels: Record<CowMetricTone, string> = {
  info: 'Inventario',
  success: 'Estable',
  warning: 'Revisión',
  danger: 'Atención',
};

function getCowStatusClass(status: CowResponse['status']) {
  if (status === 'DENTRO') return 'cows-status-inside';
  if (status === 'FUERA') return 'cows-status-outside';
  return 'cows-status-unknown';
}

export function CowsPage() {
  const [cows, setCows] = useState<CowResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CowResponse | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CowStatusFilter>('ALL');
  const [selectedCowId, setSelectedCowId] = useState<number | null>(null);

  const { hasAnyRole } = useAuthStore();
  const canWrite = hasAnyRole(['ADMINISTRADOR', 'SUPERVISOR', 'OPERADOR']);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CowFormValues>({
    resolver: zodResolver(cowSchema),
    defaultValues: {
      name: '',
      status: 'SIN_UBICACION',
      internalCode: '',
      observations: '',
    },
  });

  const loadCows = useCallback(async () => {
    setLoading(true);

    try {
      const data = await CowService.getAll();
      setCows(data);

      if (
        data.length > 0 &&
        selectedCowId &&
        !data.some((item) => item.id === selectedCowId)
      ) {
        setSelectedCowId(null);
      }
    } catch (err) {
      toast.error(AppError.from(err).serverMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedCowId]);

  useEffect(() => {
    void loadCows();
  }, [loadCows]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return cows.filter((cow) => {
      const matchesSearch =
        cow.name.toLowerCase().includes(q) ||
        cow.token.toLowerCase().includes(q) ||
        (cow.internalCode?.toLowerCase().includes(q) ?? false);

      const matchesStatus =
        statusFilter === 'ALL' ? true : cow.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [cows, search, statusFilter]);

  const selectedCow =
    selectedCowId !== null
      ? filtered.find((cow) => cow.id === selectedCowId) ??
        cows.find((cow) => cow.id === selectedCowId) ??
        null
      : null;

  const openCreate = () => {
    setEditing(null);
    reset({
      name: '',
      status: 'SIN_UBICACION',
      internalCode: '',
      observations: '',
    });
    setServerError(null);
    setModalOpen(true);
  };

  const openEdit = (cow: CowResponse) => {
    setEditing(cow);
    reset({
      name: cow.name,
      status: cow.status,
      internalCode: cow.internalCode ?? '',
      observations: cow.observations ?? '',
    });
    setServerError(null);
    setModalOpen(true);
  };

  const onSubmit = async (values: CowFormValues) => {
    setServerError(null);

    try {
      const payload = {
        name: sanitizeTextInput(values.name, 80),
        status: values.status,
        internalCode: values.internalCode
          ? sanitizeStrictInput(values.internalCode, 30)
          : undefined,
        observations: values.observations
          ? sanitizeTextInput(values.observations, 250)
          : undefined,
      };

      if (editing) {
        await CowService.update(editing.id, payload);
        toast.success('Vaca actualizada correctamente');
      } else {
        await CowService.create(payload);
        toast.success('Vaca registrada correctamente');
      }

      setModalOpen(false);
      void loadCows();
    } catch (err) {
      setServerError(AppError.from(err).serverMessage);
    }
  };

  const cowsInside = cows.filter((cow) => cow.status === 'DENTRO').length;
  const cowsOutside = cows.filter((cow) => cow.status === 'FUERA').length;
  const cowsWithoutLocation = cows.filter(
    (cow) => cow.status === 'SIN_UBICACION',
  ).length;

  const metrics: CowMetricItem[] = [
    {
      label: 'Inventario total',
      value: cows.length,
      helper: 'Animales registrados en el sistema.',
      tone: 'info',
      icon: <CattleIcon width={24} height={24} />,
    },
    {
      label: 'Dentro de geocerca',
      value: cowsInside,
      helper: 'Vacas bajo monitoreo estable.',
      tone: 'success',
      icon: <ShieldCheck size={24} />,
    },
    {
      label: 'Fuera de perímetro',
      value: cowsOutside,
      helper:
        cowsOutside > 0
          ? 'Casos que requieren seguimiento.'
          : 'Sin salidas activas registradas.',
      tone: cowsOutside > 0 ? 'danger' : 'success',
      icon: <AlertCircle size={24} />,
    },
    {
      label: 'Sin ubicación',
      value: cowsWithoutLocation,
      helper: 'Pendientes de lectura GPS reciente.',
      tone: cowsWithoutLocation > 0 ? 'warning' : 'info',
      icon: <MapPin size={24} />,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Inventario del hato"
        title="Vacas"
        badge="Inventario activo"
        subtitle="Organiza el inventario ganadero, consulta el estado del hato y gestiona la información base de cada animal."
        actions={
          canWrite ? (
            <Button size="sm" onClick={openCreate}>
              <Plus size={15} />
              Nueva vaca
            </Button>
          ) : undefined
        }
      />

      <PageContainer>
        <section className="cows-premium-hero card">
          <div className="cows-premium-hero-copy">
            <span className="cows-premium-eyebrow">
              <Sparkles size={14} />
              Gestión del hato
            </span>

            <h2>Inventario visual de vacas y estado operativo del monitoreo</h2>

            <p>
              Consulta el estado de cada animal, revisa tokens, códigos internos y
              observaciones sin afectar la trazabilidad del sistema.
            </p>

            <div className="cows-premium-pills">
              <span>
                <CattleIcon width={14} height={14} />
                {cows.length} registradas
              </span>
              <span>
                <ShieldCheck size={14} />
                {cowsInside} dentro
              </span>
              <span>
                <AlertCircle size={14} />
                {cowsOutside} fuera
              </span>
            </div>
          </div>

          <div className="cows-premium-hero-card">
            <span>Vaca seleccionada</span>
            <strong>{selectedCow?.name ?? '—'}</strong>
            <small>
              {selectedCow
                ? `Token ${selectedCow.token}`
                : 'Selecciona una fila para ver el detalle rápido.'}
            </small>
          </div>
        </section>

        <section className="cows-premium-metrics">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className={`cows-premium-metric cows-premium-metric-${metric.tone}`}
            >
              <div className="cows-premium-metric-top">
                <div className="cows-premium-metric-icon">{metric.icon}</div>

                <span className="cows-premium-metric-status">
                  <Sparkles size={13} />
                  {cowMetricToneLabels[metric.tone]}
                </span>
              </div>

              <div className="cows-premium-metric-copy">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <p>{metric.helper}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="card cows-premium-toolbar">
          <div className="cows-premium-toolbar-main">
            <div className="cows-premium-toolbar-title">
              <Search size={18} />

              <div>
                <strong>Búsqueda del inventario</strong>
                <span>Filtra por nombre, token o código interno.</span>
              </div>
            </div>

            <div className="cows-premium-search-box">
              <Search size={15} className="search-icon" />
              <input
                className="search-input cows-premium-search"
                placeholder="Buscar vaca, token o código..."
                value={search}
                maxLength={60}
                onChange={(e) =>
                  setSearch(sanitizeSearchInput(e.target.value, 60))
                }
              />
            </div>
          </div>

          <div className="cows-premium-toolbar-note">
            Mostrando {filtered.length} de {cows.length} registros del inventario
          </div>
        </section>

        <section className="card cows-premium-filters-panel">
          <div className="card-header cows-premium-section-header">
            <div>
              <span className="card-title">
                <Filter size={16} />
                Filtros rápidos
              </span>
              <p className="cows-premium-section-subtitle">
                Cambia la vista según el estado operativo de las vacas.
              </p>
            </div>
          </div>

          <div className="card-body">
            <div className="cows-premium-filter-chips">
              {statusFilters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`cows-premium-filter-chip ${
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

        {selectedCow ? (
          <section className="card cows-premium-detail-panel">
            <div className="card-header cows-premium-section-header">
              <div>
                <span className="card-title">
                  <Eye size={16} />
                  Detalle rápido
                </span>
                <p className="cows-premium-section-subtitle">
                  Resumen visual del animal seleccionado.
                </p>
              </div>

              <span
                className={`cows-status-chip ${getCowStatusClass(
                  selectedCow.status,
                )}`}
              >
                {COW_STATUS_LABELS[selectedCow.status]}
              </span>
            </div>

            <div className="card-body">
              <div className="cows-premium-detail-grid">
                <div className="cows-premium-detail-item">
                  <span>Nombre</span>
                  <strong>{selectedCow.name}</strong>
                </div>

                <div className="cows-premium-detail-item">
                  <span>Token</span>
                  <strong>{selectedCow.token}</strong>
                </div>

                <div className="cows-premium-detail-item">
                  <span>Código interno</span>
                  <strong>{selectedCow.internalCode ?? '—'}</strong>
                </div>

                <div className="cows-premium-detail-item">
                  <span>Observaciones</span>
                  <strong>{selectedCow.observations ?? 'Sin observaciones'}</strong>
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
          <section className="card cows-premium-table-panel">
            <div className="card-header cows-premium-section-header">
              <div>
                <span className="card-title">
                  <ClipboardList size={16} />
                  Inventario ganadero
                </span>
                <p className="cows-premium-section-subtitle">
                  Listado de vacas registradas y su estado operativo actual.
                </p>
              </div>

              <span className="cows-premium-table-badge">
                {filtered.length} registros
              </span>
            </div>

            <div className="card-body">
              <div className="cows-premium-table-shell">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Token</th>
                      <th>Código interno</th>
                      <th>Estado</th>
                      <th>Observaciones</th>
                      {canWrite ? <th style={{ width: 90 }}>Editar</th> : null}
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={canWrite ? 6 : 5}>
                          <div className="empty-state">
                            <CattleIcon
                              width={32}
                              height={32}
                              className="empty-state-icon"
                            />
                            <span className="empty-state-text">
                              No se encontraron vacas con el filtro actual.
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((cow) => (
                        <tr
                          key={cow.id}
                          className={
                            selectedCowId === cow.id ? 'cows-row-selected' : ''
                          }
                          onClick={() => setSelectedCowId(cow.id)}
                        >
                          <td>
                            <div className="cows-name-cell">
                              <div className="cows-name-icon">
                                <CattleIcon width={16} height={16} />
                              </div>

                              <strong>{cow.name}</strong>
                            </div>
                          </td>

                          <td>
                            <span className="cows-token-chip">
                              <Hash size={13} />
                              {cow.token}
                            </span>
                          </td>

                          <td className="td-mono">{cow.internalCode ?? '—'}</td>

                          <td>
                            <span
                              className={`cows-status-chip ${getCowStatusClass(
                                cow.status,
                              )}`}
                            >
                              {COW_STATUS_LABELS[cow.status]}
                            </span>
                          </td>

                          <td>
                            <span className="cows-observation-text">
                              {cow.observations ?? '—'}
                            </span>
                          </td>

                          {canWrite ? (
                            <td>
                              <button
                                className="btn btn-ghost btn-icon btn-sm cows-edit-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEdit(cow);
                                }}
                                title="Editar vaca"
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
          className="modal-backdrop cows-premium-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="modal cows-premium-modal">
            <div className="modal-header">
              <span className="modal-title">
                {editing ? 'Editar vaca' : 'Registrar nueva vaca'}
              </span>

              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => setModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="modal-body">
                <div className="cows-premium-modal-summary">
                  <div className="cows-premium-modal-icon">
                    <CattleIcon width={22} height={22} />
                  </div>

                  <div>
                    <strong>{editing ? editing.name : 'Nuevo registro del hato'}</strong>
                    <span>
                      {editing
                        ? `Token ${editing.token}`
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
                      <span className="cows-premium-helper-text">
                        El token lo genera el backend y no se puede editar.
                      </span>
                    </div>
                  ) : null}

                  <div className="form-group">
                    <label className="form-label">Nombre *</label>
                    <input
                      className={`form-input ${errors.name ? 'error' : ''}`}
                      placeholder="ej. Lucera"
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
                    <label className="form-label">Código interno</label>
                    <input
                      className={`form-input ${
                        errors.internalCode ? 'error' : ''
                      }`}
                      placeholder="ej. INT-042"
                      maxLength={30}
                      {...register('internalCode', {
                        setValueAs: (value) =>
                          sanitizeStrictInput(value ?? '', 30),
                      })}
                    />
                    {errors.internalCode ? (
                      <span className="form-error">
                        <AlertCircle size={11} />
                        {errors.internalCode.message}
                      </span>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Estado *</label>
                    <select
                      className={`form-select ${errors.status ? 'error' : ''}`}
                      {...register('status')}
                    >
                      <option value="SIN_UBICACION">Sin ubicación</option>
                      <option value="DENTRO">Dentro</option>
                      <option value="FUERA">Fuera</option>
                    </select>
                    {errors.status ? (
                      <span className="form-error">
                        <AlertCircle size={11} />
                        {errors.status.message}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: 14 }}>
                  <label className="form-label">Observaciones</label>
                  <textarea
                    className={`form-textarea ${
                      errors.observations ? 'error' : ''
                    }`}
                    placeholder="Notas adicionales..."
                    maxLength={250}
                    {...register('observations', {
                      setValueAs: (value) =>
                        sanitizeTextInput(value ?? '', 250),
                    })}
                  />
                  {errors.observations ? (
                    <span className="form-error">
                      <AlertCircle size={11} />
                      {errors.observations.message}
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
                    'Registrar vaca'
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