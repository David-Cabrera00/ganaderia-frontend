import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, AlertCircle, MapPin, X, ShieldCheck, Beef } from 'lucide-react';
import { GeofenceService, CowService } from '@/api/services';
import { AppError } from '@/shared/errors/AppError';
import { geofenceSchema, type GeofenceFormValues } from '@/utils/validations';
import { sanitizeSearchInput, sanitizeTextInput } from '@/shared/utils/sanitize';
import type { GeofenceResponse, CowResponse } from '@/types';
import { PageContainer } from '@/layouts/components/PageContainer';
import { PageHeader } from '@/layouts/components/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { MetricCard } from '@/shared/components/ui/MetricCard';
import { GeofencesMap } from '@/features/geofences/components/GeofencesMap';
import toast from 'react-hot-toast';

export function GeofencesPage() {
  const [geofences, setGeofences] = useState<GeofenceResponse[]>([]);
  const [filtered, setFiltered] = useState<GeofenceResponse[]>([]);
  const [cows, setCows] = useState<CowResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedGeofenceId, setSelectedGeofenceId] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<GeofenceFormValues>({ resolver: zodResolver(geofenceSchema), defaultValues: { active: true } });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [geofencesData, cowsData] = await Promise.all([GeofenceService.getAll(), CowService.getAll()]);
      setGeofences(geofencesData);
      setFiltered(geofencesData);
      setCows(cowsData);
    } catch (err) {
      toast.error(AppError.from(err).serverMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();
    const nextFiltered = geofences.filter((geofence) => geofence.name.toLowerCase().includes(q) || (geofence.cowName?.toLowerCase().includes(q) ?? false));
    setFiltered(nextFiltered);
    if (selectedGeofenceId && !nextFiltered.some((item) => item.id === selectedGeofenceId)) setSelectedGeofenceId(null);
  }, [search, geofences, selectedGeofenceId]);

  const onSubmit = async (values: GeofenceFormValues) => {
    setServerError(null);
    try {
      await GeofenceService.create({ name: sanitizeTextInput(values.name, 80), centerLatitude: values.centerLatitude, centerLongitude: values.centerLongitude, radiusMeters: values.radiusMeters, active: values.active, cowId: values.cowId });
      toast.success('Geocerca creada correctamente');
      setModalOpen(false);
      void load();
    } catch (err) {
      setServerError(AppError.from(err).serverMessage);
    }
  };

  const activeCount = geofences.filter((geofence) => geofence.active).length;
  const assignedCount = geofences.filter((geofence) => geofence.cowId !== null).length;
  const averageRadius = geofences.length > 0 ? Math.round(geofences.reduce((sum, geofence) => sum + geofence.radiusMeters, 0) / geofences.length) : 0;

  return (
    <>
      <PageHeader eyebrow="Perímetros inteligentes" title="Geocercas" badge="Control territorial" subtitle="Configura radios, centros geográficos y asignaciones para dejar listo el monitoreo de campo antes del despliegue real." actions={<Button size="sm" onClick={() => { reset({ active: true }); setServerError(null); setModalOpen(true); }}><Plus size={15} /> Nueva geocerca</Button>} />
      <PageContainer>
        <section className="overview-grid">
          <MetricCard icon={<MapPin size={20} />} label="Geocercas totales" value={geofences.length} helper="Perímetros configurados en local" tone="info" />
          <MetricCard icon={<ShieldCheck size={20} />} label="Activas" value={activeCount} helper="Zonas listas para seguimiento" tone="success" />
          <MetricCard icon={<Beef size={20} />} label="Asignadas" value={assignedCount} helper="Perímetros vinculados a animales" tone="default" />
          <MetricCard icon={<AlertCircle size={20} />} label="Radio promedio" value={`${averageRadius} m`} helper="Promedio de cobertura configurada" tone="warning" />
        </section>
        <div className="toolbar toolbar-panel">
          <div className="toolbar-left"><div className="search-input-wrapper"><Search size={15} className="search-icon" /><input className="search-input" placeholder="Buscar por nombre de geocerca o vaca..." value={search} maxLength={60} onChange={(e) => setSearch(sanitizeSearchInput(e.target.value, 60))} /></div></div>
          <span className="page-summary-note">{filtered.length} zonas visibles en el panel actual</span>
        </div>
        <section className="card" style={{ marginTop: 16 }}>
          <div className="card-header"><span className="card-title">Selección rápida</span></div>
          <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <button type="button" className="btn btn-secondary btn-sm" style={selectedGeofenceId === null ? { background: 'var(--accent-dim)', borderColor: 'var(--accent)', color: 'var(--accent)' } : undefined} onClick={() => setSelectedGeofenceId(null)}>Ver todas</button>
            {filtered.map((geofence) => <button key={geofence.id} type="button" className="btn btn-secondary btn-sm" style={selectedGeofenceId === geofence.id ? { background: 'var(--accent-dim)', borderColor: 'var(--accent)', color: 'var(--accent)' } : undefined} onClick={() => setSelectedGeofenceId(geofence.id)}>{geofence.name}</button>)}
          </div>
        </section>
        <GeofencesMap geofences={filtered} selectedGeofenceId={selectedGeofenceId} onSelect={setSelectedGeofenceId} />
        {loading ? <div className="loading-center"><div className="loading-spinner" /></div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Nombre</th><th>Latitud centro</th><th>Longitud centro</th><th>Radio (m)</th><th>Vaca asignada</th><th>Activa</th></tr></thead>
              <tbody>
                {filtered.length === 0 ? <tr><td colSpan={6}><div className="empty-state"><MapPin size={32} className="empty-state-icon" /><span className="empty-state-text">No hay geocercas que coincidan con el filtro actual</span></div></td></tr> : filtered.map((geofence) => (
                  <tr key={geofence.id} onClick={() => setSelectedGeofenceId(geofence.id)} style={{ cursor: 'pointer', background: selectedGeofenceId === geofence.id ? 'var(--accent-dim)' : undefined }}>
                    <td style={{ fontWeight: 500 }}>{geofence.name}</td><td className="td-mono">{geofence.centerLatitude.toFixed(6)}</td><td className="td-mono">{geofence.centerLongitude.toFixed(6)}</td><td className="td-mono">{geofence.radiusMeters} m</td><td>{geofence.cowName ?? <span style={{ color: 'var(--text-muted)' }}>Sin asignar</span>}</td><td><span className={`badge ${geofence.active ? 'badge-green' : 'badge-gray'}`}>{geofence.active ? 'Activa' : 'Inactiva'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageContainer>
      {modalOpen ? (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="modal">
            <div className="modal-header"><span className="modal-title">Nueva geocerca</span><button className="btn btn-ghost btn-icon" onClick={() => setModalOpen(false)}><X size={16} /></button></div>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="modal-body">
                {serverError ? <div className="alert-banner error" style={{ marginBottom: 16 }}><AlertCircle size={14} style={{ display: 'inline', marginRight: 6 }} />{serverError}</div> : null}
                <div className="form-grid">
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Nombre *</label><input className={`form-input ${errors.name ? 'error' : ''}`} placeholder="ej. Potrero Norte" maxLength={80} {...register('name', { setValueAs: (value) => sanitizeTextInput(value ?? '', 80) })} />{errors.name ? <span className="form-error"><AlertCircle size={11} /> {errors.name.message}</span> : null}</div>
                  <div className="form-group"><label className="form-label">Latitud centro *</label><input type="number" step="any" className={`form-input ${errors.centerLatitude ? 'error' : ''}`} placeholder="1.213600" {...register('centerLatitude', { setValueAs: (value) => value === '' ? undefined : Number(value) })} />{errors.centerLatitude ? <span className="form-error"><AlertCircle size={11} /> {errors.centerLatitude.message}</span> : null}</div>
                  <div className="form-group"><label className="form-label">Longitud centro *</label><input type="number" step="any" className={`form-input ${errors.centerLongitude ? 'error' : ''}`} placeholder="-77.281100" {...register('centerLongitude', { setValueAs: (value) => value === '' ? undefined : Number(value) })} />{errors.centerLongitude ? <span className="form-error"><AlertCircle size={11} /> {errors.centerLongitude.message}</span> : null}</div>
                  <div className="form-group"><label className="form-label">Radio (m) *</label><input type="number" min={1} className={`form-input ${errors.radiusMeters ? 'error' : ''}`} placeholder="500" {...register('radiusMeters', { setValueAs: (value) => value === '' ? undefined : Number(value) })} />{errors.radiusMeters ? <span className="form-error"><AlertCircle size={11} /> {errors.radiusMeters.message}</span> : null}</div>
                  <div className="form-group"><label className="form-label">Vaca asignada</label><select className="form-select" {...register('cowId', { setValueAs: (value) => value === '' ? undefined : Number(value) })}><option value="">Sin asignar</option>{cows.map((cow) => <option key={cow.id} value={cow.id}>{cow.name} ({cow.token})</option>)}</select></div>
                  <div className="form-group" style={{ alignSelf: 'end' }}><label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="checkbox" defaultChecked {...register('active')} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} /><span className="form-label" style={{ margin: 0 }}>Geocerca activa</span></label></div>
                </div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button><button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? <><span className="loading-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Guardando...</> : 'Crear geocerca'}</button></div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
