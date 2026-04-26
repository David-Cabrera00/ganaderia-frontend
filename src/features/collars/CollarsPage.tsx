import { useEffect, useMemo, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Search, AlertCircle, Radio, X, Power, PowerOff, Link, ShieldCheck, Bell, BatteryWarning, Cpu } from 'lucide-react';
import { CollarService, CowService } from '@/api/services';
import { AppError } from '@/shared/errors/AppError';
import { useAuthStore } from '@/stores/authStore';
import { collarSchema, type CollarFormValues } from '@/utils/validations';
import { COLLAR_STATUS_COLORS, COLLAR_STATUS_LABELS, SIGNAL_STATUS_LABELS, formatDateTime, formatBattery } from '@/utils/helpers';
import { sanitizeSearchInput, sanitizeStrictInput, sanitizeTextInput } from '@/shared/utils/sanitize';
import type { CollarResponse, CowResponse } from '@/types';
import { PageContainer } from '@/layouts/components/PageContainer';
import { PageHeader } from '@/layouts/components/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { MetricCard } from '@/shared/components/ui/MetricCard';
import toast from 'react-hot-toast';

type CollarStatusFilter = 'ALL' | 'ACTIVO' | 'INACTIVO' | 'MANTENIMIENTO';

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
  const canWrite = hasAnyRole(['ADMINISTRADOR', 'SUPERVISOR', 'TECNICO']);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CollarFormValues>({ resolver: zodResolver(collarSchema) });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [collarData, cowData] = await Promise.all([CollarService.getAll(), CowService.getAll()]);
      setCollars(collarData);
      setCows(cowData);
      if (selectedCollarId !== null && !collarData.some((item) => item.id === selectedCollarId)) setSelectedCollarId(null);
    } catch (err) { toast.error(AppError.from(err).serverMessage); } finally { setLoading(false); }
  }, [selectedCollarId]);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return collars.filter((collar) => {
      const matchesSearch = collar.token.toLowerCase().includes(q) || (collar.cowName?.toLowerCase().includes(q) ?? false) || (collar.firmwareVersion?.toLowerCase().includes(q) ?? false);
      const matchesStatus = statusFilter === 'ALL' ? true : collar.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [collars, search, statusFilter]);

  const selectedCollar = selectedCollarId !== null ? filtered.find((item) => item.id === selectedCollarId) ?? collars.find((item) => item.id === selectedCollarId) ?? null : null;

  const openCreate = () => { setEditing(null); reset({ token: '', status: 'ACTIVO', enabled: true, firmwareVersion: '', notes: '' }); setServerError(null); setModalOpen(true); };
  const openEdit = (collar: CollarResponse) => { setEditing(collar); reset({ token: collar.token, status: collar.status as CollarFormValues['status'], cowId: collar.cowId ?? undefined, batteryLevel: collar.batteryLevel ?? undefined, firmwareVersion: collar.firmwareVersion ?? '', notes: collar.notes ?? '', enabled: collar.enabled }); setServerError(null); setModalOpen(true); };

  const handleToggle = async (collar: CollarResponse) => {
    try { if (collar.enabled) { await CollarService.disable(collar.id); toast.success('Collar deshabilitado'); } else { await CollarService.enable(collar.id); toast.success('Collar habilitado'); } void load(); } catch (err) { toast.error(AppError.from(err).serverMessage); }
  };

  const onSubmit = async (values: CollarFormValues) => {
    setServerError(null);
    try {
      const payload = { token: sanitizeStrictInput(values.token, 30), status: values.status, cowId: values.cowId, batteryLevel: values.batteryLevel, firmwareVersion: values.firmwareVersion ? sanitizeStrictInput(values.firmwareVersion, 30) : undefined, notes: values.notes ? sanitizeTextInput(values.notes, 250) : undefined, enabled: values.enabled };
      if (editing) { await CollarService.update(editing.id, payload); toast.success('Collar actualizado'); } else { await CollarService.create(payload); toast.success('Collar registrado'); }
      setModalOpen(false); void load();
    } catch (err) { setServerError(AppError.from(err).serverMessage); }
  };

  const enabledCount = collars.filter((item) => item.enabled).length;
  const lowBatteryCount = collars.filter((item) => (item.batteryLevel ?? 100) < 20).length;
  const maintenanceCount = collars.filter((item) => item.status === 'MANTENIMIENTO').length;

  return (
    <>
      <PageHeader eyebrow="Dispositivos de campo" title="Collares" badge="Seguimiento GPS" subtitle="Administra tokens, batería, asignaciones y disponibilidad operativa de los collares." actions={canWrite ? <Button size="sm" onClick={openCreate}><Plus size={15} /> Nuevo collar</Button> : undefined} />
      <PageContainer>
        <section className="overview-grid">
          <MetricCard icon={<Radio size={20} />} label="Collares totales" value={collars.length} helper="Dispositivos registrados en el sistema" tone="info" />
          <MetricCard icon={<ShieldCheck size={20} />} label="Habilitados" value={enabledCount} helper="Equipos listos para monitoreo" tone="success" />
          <MetricCard icon={<BatteryWarning size={20} />} label="Batería baja" value={lowBatteryCount} helper="Menos del 20% de carga" tone={lowBatteryCount > 0 ? 'warning' : 'success'} />
          <MetricCard icon={<Cpu size={20} />} label="Mantenimiento" value={maintenanceCount} helper="Dispositivos en revisión técnica" tone={maintenanceCount > 0 ? 'warning' : 'info'} />
        </section>
        <div className="toolbar toolbar-panel"><div className="toolbar-left"><div className="search-input-wrapper"><Search size={15} className="search-icon" /><input className="search-input" placeholder="Buscar por token, vaca o firmware..." value={search} maxLength={60} onChange={(e) => setSearch(sanitizeSearchInput(e.target.value, 60))} /></div></div><span className="page-summary-note">Mostrando {filtered.length} de {collars.length} registros</span></div>
        <section className="card" style={{ marginTop: 16 }}><div className="card-header"><span className="card-title"><Bell size={16} /> Filtros rápidos</span></div><div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>{[{ label: 'Todos', value: 'ALL' as const }, { label: 'Activos', value: 'ACTIVO' as const }, { label: 'Inactivos', value: 'INACTIVO' as const }, { label: 'Mantenimiento', value: 'MANTENIMIENTO' as const }].map((item) => <button key={item.value} type="button" className="btn btn-secondary btn-sm" style={statusFilter === item.value ? { background: 'var(--accent-dim)', borderColor: 'var(--accent)', color: 'var(--accent)' } : undefined} onClick={() => setStatusFilter(item.value)}>{item.label}</button>)}</div></section>
        {selectedCollar ? <section className="card" style={{ marginTop: 16 }}><div className="card-header"><span className="card-title">Detalle rápido</span><span className={`badge ${COLLAR_STATUS_COLORS[selectedCollar.status]}`}>{COLLAR_STATUS_LABELS[selectedCollar.status]}</span></div><div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}><div><div className="report-summary-label">Token</div><strong>{selectedCollar.token}</strong></div><div><div className="report-summary-label">Vaca asignada</div><strong>{selectedCollar.cowName ?? 'Sin asignar'}</strong></div><div><div className="report-summary-label">Batería</div><strong>{selectedCollar.batteryLevel !== null ? formatBattery(selectedCollar.batteryLevel) : '—'}</strong></div><div><div className="report-summary-label">Firmware</div><strong>{selectedCollar.firmwareVersion ?? '—'}</strong></div></div><div className="card-body" style={{ paddingTop: 0, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}><div><div className="report-summary-label">Señal</div><strong>{selectedCollar.signalStatus ? SIGNAL_STATUS_LABELS[selectedCollar.signalStatus] : '—'}</strong></div><div><div className="report-summary-label">Última vez visto</div><strong>{formatDateTime(selectedCollar.lastSeenAt)}</strong></div><div><div className="report-summary-label">Notas</div><strong>{selectedCollar.notes ?? 'Sin observaciones'}</strong></div></div></section> : null}
        {loading ? <div className="loading-center"><div className="loading-spinner" /></div> : <div className="table-wrapper" style={{ marginTop: 16 }}><table><thead><tr><th>Token</th><th>Estado</th><th>Habilitado</th><th>Vaca asignada</th><th>Batería</th><th>Señal</th><th>Última vez visto</th>{canWrite ? <th style={{ width: 110 }}>Acciones</th> : null}</tr></thead><tbody>{filtered.length === 0 ? <tr><td colSpan={canWrite ? 8 : 7}><div className="empty-state"><Radio size={32} className="empty-state-icon" /><span className="empty-state-text">No se encontraron collares con el filtro actual</span></div></td></tr> : filtered.map((collar) => <tr key={collar.id} onClick={() => setSelectedCollarId(collar.id)} style={{ cursor: 'pointer', background: selectedCollarId === collar.id ? 'var(--accent-dim)' : undefined }}><td className="td-mono">{collar.token}</td><td><span className={`badge ${COLLAR_STATUS_COLORS[collar.status]}`}>{COLLAR_STATUS_LABELS[collar.status]}</span></td><td><span className={`badge ${collar.enabled ? 'badge-green' : 'badge-gray'}`}>{collar.enabled ? 'Sí' : 'No'}</span></td><td>{collar.cowName ? <><Link size={12} style={{ display: 'inline', marginRight: 4 }} />{collar.cowName}</> : <span style={{ color: 'var(--text-muted)' }}>Sin asignar</span>}</td><td className="td-mono">{collar.batteryLevel !== null ? <span style={{ color: collar.batteryLevel < 20 ? 'var(--red)' : collar.batteryLevel < 50 ? 'var(--yellow)' : 'var(--blue)' }}>{formatBattery(collar.batteryLevel)}</span> : '—'}</td><td>{collar.signalStatus ? SIGNAL_STATUS_LABELS[collar.signalStatus] : '—'}</td><td className="td-mono">{formatDateTime(collar.lastSeenAt)}</td>{canWrite ? <td><div style={{ display: 'flex', gap: 4 }}><button className="btn btn-ghost btn-icon btn-sm" onClick={(e) => { e.stopPropagation(); openEdit(collar); }} title="Editar collar"><Pencil size={13} /></button><button className={`btn btn-icon btn-sm ${collar.enabled ? 'btn-danger' : 'btn-success'}`} onClick={(e) => { e.stopPropagation(); void handleToggle(collar); }} title={collar.enabled ? 'Deshabilitar' : 'Habilitar'}>{collar.enabled ? <PowerOff size={13} /> : <Power size={13} />}</button></div></td> : null}</tr>)}</tbody></table></div>}
      </PageContainer>
      {modalOpen ? <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}><div className="modal"><div className="modal-header"><span className="modal-title">{editing ? 'Editar collar' : 'Registrar collar'}</span><button className="btn btn-ghost btn-icon" onClick={() => setModalOpen(false)}><X size={16} /></button></div><form onSubmit={handleSubmit(onSubmit)} noValidate><div className="modal-body">{serverError ? <div className="alert-banner error" style={{ marginBottom: 16 }}><AlertCircle size={14} style={{ display: 'inline', marginRight: 6 }} />{serverError}</div> : null}<div className="form-grid"><div className="form-group"><label className="form-label">Token *</label><input className={`form-input ${errors.token ? 'error' : ''}`} placeholder="ej. COL-001" maxLength={30} {...register('token', { setValueAs: (value) => sanitizeStrictInput(value ?? '', 30) })} onKeyDown={(e) => { if (e.key === ' ') e.preventDefault(); }} />{errors.token ? <span className="form-error"><AlertCircle size={11} /> {errors.token.message}</span> : null}<span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sin espacios. Máximo 30 caracteres.</span></div><div className="form-group"><label className="form-label">Estado *</label><select className={`form-select ${errors.status ? 'error' : ''}`} {...register('status')}><option value="ACTIVO">Activo</option><option value="INACTIVO">Inactivo</option><option value="MANTENIMIENTO">Mantenimiento</option></select>{errors.status ? <span className="form-error"><AlertCircle size={11} /> {errors.status.message}</span> : null}</div><div className="form-group"><label className="form-label">Vaca asignada</label><select className="form-select" {...register('cowId', { setValueAs: (value) => value === '' ? undefined : Number(value) })}><option value="">Sin asignar</option>{cows.map((cow) => <option key={cow.id} value={cow.id}>{cow.name} ({cow.token})</option>)}</select></div><div className="form-group"><label className="form-label">Nivel de batería (%)</label><input type="number" min={0} max={100} className={`form-input ${errors.batteryLevel ? 'error' : ''}`} placeholder="0-100" {...register('batteryLevel', { setValueAs: (value) => value === '' ? undefined : Number(value) })} />{errors.batteryLevel ? <span className="form-error"><AlertCircle size={11} /> {errors.batteryLevel.message}</span> : null}</div><div className="form-group"><label className="form-label">Firmware</label><input className="form-input" placeholder="ej. v1.2.3" maxLength={30} {...register('firmwareVersion', { setValueAs: (value) => sanitizeStrictInput(value ?? '', 30) })} /></div><div className="form-group" style={{ alignSelf: 'end' }}><label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="checkbox" {...register('enabled')} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} /><span className="form-label" style={{ margin: 0 }}>Collar habilitado</span></label></div></div><div className="form-group" style={{ marginTop: 14 }}><label className="form-label">Notas</label><textarea className={`form-textarea ${errors.notes ? 'error' : ''}`} placeholder="Observaciones técnicas..." maxLength={250} {...register('notes', { setValueAs: (value) => sanitizeTextInput(value ?? '', 250) })} />{errors.notes ? <span className="form-error"><AlertCircle size={11} /> {errors.notes.message}</span> : null}</div></div><div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button><button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? <><span className="loading-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Guardando...</> : editing ? 'Guardar cambios' : 'Registrar collar'}</button></div></form></div></div> : null}
    </>
  );
}
