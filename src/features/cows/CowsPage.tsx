import { useEffect, useMemo, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Search, AlertCircle, X, MapPin, ShieldCheck, Filter } from 'lucide-react';
import { CattleIcon } from '@/shared/components/ui/CattleIcon';
import { CowService } from '@/api/services';
import { AppError } from '@/shared/errors/AppError';
import { useAuthStore } from '@/stores/authStore';
import { cowSchema, type CowFormValues } from '@/utils/validations';
import { COW_STATUS_COLORS, COW_STATUS_LABELS } from '@/utils/helpers';
import { sanitizeSearchInput, sanitizeStrictInput, sanitizeTextInput } from '@/shared/utils/sanitize';
import type { CowResponse } from '@/types';
import { PageContainer } from '@/layouts/components/PageContainer';
import { PageHeader } from '@/layouts/components/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { MetricCard } from '@/shared/components/ui/MetricCard';
import toast from 'react-hot-toast';

type CowStatusFilter = 'ALL' | 'DENTRO' | 'FUERA' | 'SIN_UBICACION';

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

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CowFormValues>({ resolver: zodResolver(cowSchema) });

  const loadCows = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CowService.getAll();
      setCows(data);
      if (data.length > 0 && selectedCowId && !data.some((item) => item.id === selectedCowId)) setSelectedCowId(null);
    } catch (err) {
      toast.error(AppError.from(err).serverMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedCowId]);

  useEffect(() => { void loadCows(); }, [loadCows]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return cows.filter((cow) => {
      const matchesSearch = cow.name.toLowerCase().includes(q) || cow.token.toLowerCase().includes(q) || (cow.internalCode?.toLowerCase().includes(q) ?? false);
      const matchesStatus = statusFilter === 'ALL' ? true : cow.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [cows, search, statusFilter]);

  const selectedCow = selectedCowId !== null ? filtered.find((cow) => cow.id === selectedCowId) ?? cows.find((cow) => cow.id === selectedCowId) ?? null : null;

  const openCreate = () => { setEditing(null); reset({ token: '', name: '', status: 'SIN_UBICACION', internalCode: '', observations: '' }); setServerError(null); setModalOpen(true); };
  const openEdit = (cow: CowResponse) => { setEditing(cow); reset({ token: cow.token, name: cow.name, status: cow.status, internalCode: cow.internalCode ?? '', observations: cow.observations ?? '' }); setServerError(null); setModalOpen(true); };

  const onSubmit = async (values: CowFormValues) => {
    setServerError(null);
    try {
      const payload = { token: sanitizeStrictInput(values.token, 30), name: sanitizeTextInput(values.name, 80), status: values.status, internalCode: values.internalCode ? sanitizeStrictInput(values.internalCode, 30) : undefined, observations: values.observations ? sanitizeTextInput(values.observations, 250) : undefined };
      if (editing) { await CowService.update(editing.id, payload); toast.success('Vaca actualizada correctamente'); } else { await CowService.create(payload); toast.success('Vaca registrada correctamente'); }
      setModalOpen(false); void loadCows();
    } catch (err) { setServerError(AppError.from(err).serverMessage); }
  };

  const cowsInside = cows.filter((cow) => cow.status === 'DENTRO').length;
  const cowsOutside = cows.filter((cow) => cow.status === 'FUERA').length;
  const cowsWithoutLocation = cows.filter((cow) => cow.status === 'SIN_UBICACION').length;

  return (
    <>
      <PageHeader eyebrow="Inventario del hato" title="Vacas" badge="Inventario activo" subtitle="Organiza el inventario ganadero, consulta el estado del hato y gestiona la información base de cada animal." actions={canWrite ? <Button size="sm" onClick={openCreate}><Plus size={15} /> Nueva vaca</Button> : undefined} />
      <PageContainer>
        <section className="overview-grid">
          <MetricCard icon={<CattleIcon width={20} height={20} />} label="Inventario total" value={cows.length} helper="Animales registrados en el sistema" tone="info" />
          <MetricCard icon={<ShieldCheck size={20} />} label="Dentro de geocerca" value={cowsInside} helper="Vacas bajo monitoreo estable" tone="success" />
          <MetricCard icon={<AlertCircle size={20} />} label="Fuera de perímetro" value={cowsOutside} helper="Casos que requieren seguimiento" tone={cowsOutside > 0 ? 'danger' : 'success'} />
          <MetricCard icon={<MapPin size={20} />} label="Sin ubicación" value={cowsWithoutLocation} helper="Pendientes de lectura GPS reciente" tone={cowsWithoutLocation > 0 ? 'warning' : 'info'} />
        </section>
        <div className="toolbar toolbar-panel">
          <div className="toolbar-left"><div className="search-input-wrapper"><Search size={15} className="search-icon" /><input className="search-input" placeholder="Buscar por nombre, token o código interno..." value={search} maxLength={60} onChange={(e) => setSearch(sanitizeSearchInput(e.target.value, 60))} /></div></div>
          <span className="page-summary-note">Mostrando {filtered.length} de {cows.length} registros</span>
        </div>
        <section className="card" style={{ marginTop: 16 }}>
          <div className="card-header"><span className="card-title"><Filter size={16} /> Filtros rápidos</span></div>
          <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[{ label: 'Todas', value: 'ALL' as const }, { label: 'Dentro', value: 'DENTRO' as const }, { label: 'Fuera', value: 'FUERA' as const }, { label: 'Sin ubicación', value: 'SIN_UBICACION' as const }].map((item) => <button key={item.value} type="button" className="btn btn-secondary btn-sm" style={statusFilter === item.value ? { background: 'var(--accent-dim)', borderColor: 'var(--accent)', color: 'var(--accent)' } : undefined} onClick={() => setStatusFilter(item.value)}>{item.label}</button>)}
          </div>
        </section>
        {selectedCow ? <section className="card" style={{ marginTop: 16 }}><div className="card-header"><span className="card-title">Detalle rápido</span><span className={`badge ${COW_STATUS_COLORS[selectedCow.status]}`}>{COW_STATUS_LABELS[selectedCow.status]}</span></div><div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}><div><div className="report-summary-label">Nombre</div><strong>{selectedCow.name}</strong></div><div><div className="report-summary-label">Token</div><strong>{selectedCow.token}</strong></div><div><div className="report-summary-label">Código interno</div><strong>{selectedCow.internalCode ?? '—'}</strong></div><div><div className="report-summary-label">Observaciones</div><strong>{selectedCow.observations ?? 'Sin observaciones'}</strong></div></div></section> : null}
        {loading ? <div className="loading-center"><div className="loading-spinner" /></div> : (
          <div className="table-wrapper" style={{ marginTop: 16 }}><table><thead><tr><th>Nombre</th><th>Token</th><th>Código interno</th><th>Estado</th><th>Observaciones</th>{canWrite ? <th style={{ width: 60 }}>Editar</th> : null}</tr></thead><tbody>{filtered.length === 0 ? <tr><td colSpan={canWrite ? 6 : 5}><div className="empty-state"><CattleIcon width={32} height={32} className="empty-state-icon" /><span className="empty-state-text">No se encontraron vacas con el filtro actual</span></div></td></tr> : filtered.map((cow) => <tr key={cow.id} onClick={() => setSelectedCowId(cow.id)} style={{ cursor: 'pointer', background: selectedCowId === cow.id ? 'var(--accent-dim)' : undefined }}><td style={{ fontWeight: 500 }}>{cow.name}</td><td className="td-mono">{cow.token}</td><td className="td-mono">{cow.internalCode ?? '—'}</td><td><span className={`badge ${COW_STATUS_COLORS[cow.status]}`}>{COW_STATUS_LABELS[cow.status]}</span></td><td style={{ color: 'var(--text-secondary)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cow.observations ?? '—'}</td>{canWrite ? <td><button className="btn btn-ghost btn-icon btn-sm" onClick={(e) => { e.stopPropagation(); openEdit(cow); }} title="Editar vaca"><Pencil size={14} /></button></td> : null}</tr>)}</tbody></table></div>
        )}
      </PageContainer>
      {modalOpen ? <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}><div className="modal"><div className="modal-header"><span className="modal-title">{editing ? 'Editar vaca' : 'Registrar nueva vaca'}</span><button className="btn btn-ghost btn-icon" onClick={() => setModalOpen(false)}><X size={16} /></button></div><form onSubmit={handleSubmit(onSubmit)} noValidate><div className="modal-body">{serverError ? <div className="alert-banner error" style={{ marginBottom: 16 }}><AlertCircle size={14} style={{ display: 'inline', marginRight: 6 }} />{serverError}</div> : null}<div className="form-grid"><div className="form-group"><label className="form-label">Token *</label><input className={`form-input ${errors.token ? 'error' : ''}`} placeholder="ej. COW-001" maxLength={30} {...register('token', { setValueAs: (value) => sanitizeStrictInput(value ?? '', 30) })} onKeyDown={(e) => { if (e.key === ' ') e.preventDefault(); }} />{errors.token ? <span className="form-error"><AlertCircle size={11} /> {errors.token.message}</span> : null}<span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Debe ser único. Sin espacios.</span></div><div className="form-group"><label className="form-label">Código interno</label><input className={`form-input ${errors.internalCode ? 'error' : ''}`} placeholder="ej. INT-042" maxLength={30} {...register('internalCode', { setValueAs: (value) => sanitizeStrictInput(value ?? '', 30) })} />{errors.internalCode ? <span className="form-error"><AlertCircle size={11} /> {errors.internalCode.message}</span> : null}</div><div className="form-group"><label className="form-label">Nombre *</label><input className={`form-input ${errors.name ? 'error' : ''}`} placeholder="ej. Lucera" maxLength={80} {...register('name', { setValueAs: (value) => sanitizeTextInput(value ?? '', 80) })} />{errors.name ? <span className="form-error"><AlertCircle size={11} /> {errors.name.message}</span> : null}</div><div className="form-group"><label className="form-label">Estado *</label><select className={`form-select ${errors.status ? 'error' : ''}`} {...register('status')}><option value="SIN_UBICACION">Sin ubicación</option><option value="DENTRO">Dentro</option><option value="FUERA">Fuera</option></select>{errors.status ? <span className="form-error"><AlertCircle size={11} /> {errors.status.message}</span> : null}</div></div><div className="form-group" style={{ marginTop: 14 }}><label className="form-label">Observaciones</label><textarea className={`form-textarea ${errors.observations ? 'error' : ''}`} placeholder="Notas adicionales..." maxLength={250} {...register('observations', { setValueAs: (value) => sanitizeTextInput(value ?? '', 250) })} />{errors.observations ? <span className="form-error"><AlertCircle size={11} /> {errors.observations.message}</span> : null}</div></div><div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button><button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? <><span className="loading-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Guardando...</> : editing ? 'Guardar cambios' : 'Registrar vaca'}</button></div></form></div></div> : null}
    </>
  );
}
