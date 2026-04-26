import { useEffect, useState, useCallback, type ChangeEvent } from 'react';
import { Navigation, Search, MapPin, ShieldCheck, AlertCircle } from 'lucide-react';
import { LocationService, CowService, GeofenceService } from '@/api/services';
import { AppError } from '@/api/httpClient';
import { formatDateTime } from '@/utils/helpers';
import type { LocationResponse, CowResponse, Page, GeofenceResponse } from '@/types';
import { PageContainer } from '@/layouts/components/PageContainer';
import { PageHeader } from '@/layouts/components/PageHeader';
import { MetricCard } from '@/shared/components/ui/MetricCard';
import { LocationsMap } from '@/features/locations/components/LocationsMap';
import toast from 'react-hot-toast';

export function LocationsPage() {
  const [cows, setCows] = useState<CowResponse[]>([]);
  const [geofences, setGeofences] = useState<GeofenceResponse[]>([]);
  const [selectedCowId, setSelectedCowId] = useState<number | ''>('');
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [pageData, setPageData] = useState<Omit<Page<LocationResponse>, 'content'> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingCows, setLoadingCows] = useState(true);

  useEffect(() => {
    Promise.all([CowService.getAll(), GeofenceService.getAll()])
      .then(([cowsData, geofencesData]) => {
        setCows(cowsData);
        setGeofences(geofencesData);
      })
      .catch((error) => toast.error(AppError.from(error).serverMessage))
      .finally(() => setLoadingCows(false));
  }, []);

  const load = useCallback(async () => {
    if (!selectedCowId) {
      setLocations([]);
      setPageData(null);
      return;
    }
    setLoading(true);
    try {
      const response = await LocationService.getByCow(Number(selectedCowId), page, 15);
      setLocations(response.content);
      setPageData({ totalElements: response.totalElements, totalPages: response.totalPages, number: response.number, size: response.size, first: response.first, last: response.last });
    } catch (err) {
      toast.error(AppError.from(err).serverMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedCowId, page]);

  useEffect(() => { void load(); }, [load]);

  const handleCowChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCowId(event.target.value === '' ? '' : Number(event.target.value));
    setPage(0);
  };

  const selectedCow = selectedCowId ? cows.find((cow) => cow.id === selectedCowId) ?? null : null;
  const selectedGeofence = selectedCowId ? geofences.find((item) => item.cowId === Number(selectedCowId)) ?? null : null;

  const insideCount = locations.filter((location) => location.insideGeofence).length;
  const outsideCount = locations.filter((location) => !location.insideGeofence).length;
  const lastRecord = locations[0]?.recordedAt ?? null;

  return (
    <>
      <PageHeader eyebrow="Trazabilidad GPS" title="Ubicaciones" badge="Historial GPS" subtitle="Consulta el recorrido por vaca, revisa entradas y salidas de perímetro y visualiza el contexto geográfico del monitoreo." />
      <PageContainer>
        <section className="overview-grid">
          <MetricCard icon={<Navigation size={20} />} label="Registros visibles" value={locations.length} helper="Posiciones cargadas en la página actual" tone="info" />
          <MetricCard icon={<ShieldCheck size={20} />} label="Dentro de geocerca" value={insideCount} helper="Lecturas dentro del perímetro" tone="success" />
          <MetricCard icon={<AlertCircle size={20} />} label="Fuera de geocerca" value={outsideCount} helper="Lecturas que requieren revisión" tone={outsideCount > 0 ? 'danger' : 'success'} />
          <MetricCard icon={<MapPin size={20} />} label="Última lectura" value={lastRecord ? formatDateTime(lastRecord) : 'Sin datos'} helper={selectedCow ? `Historial de ${selectedCow.name}` : 'Selecciona una vaca para cargar su recorrido'} tone="warning" />
        </section>
        <div className="toolbar toolbar-panel">
          <div className="toolbar-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search size={15} style={{ color: 'var(--text-muted)' }} />
              <select className="form-select" style={{ width: 280 }} value={selectedCowId} onChange={handleCowChange} disabled={loadingCows}>
                <option value="">Seleccionar vaca...</option>
                {cows.map((cow) => <option key={cow.id} value={cow.id}>{cow.name} — {cow.token}</option>)}
              </select>
            </div>
          </div>
          {pageData ? <span className="page-summary-note">{pageData.totalElements} registros en el historial completo</span> : <span className="page-summary-note">Selecciona una vaca para consultar su trazabilidad</span>}
        </div>
        {selectedCowId ? <LocationsMap locations={locations} cowName={selectedCow?.name ?? null} geofence={selectedGeofence} /> : null}
        {!selectedCowId ? (
          <div className="empty-state" style={{ marginTop: 60 }}><Navigation size={48} className="empty-state-icon" /><span className="empty-state-text">Selecciona una vaca para ver su historial de ubicaciones</span></div>
        ) : loading ? (
          <div className="loading-center"><div className="loading-spinner" /></div>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>#</th><th>Vaca</th><th>Latitud</th><th>Longitud</th><th>Dentro de geocerca</th><th>Registrado</th></tr></thead>
                <tbody>
                  {locations.length === 0 ? (
                    <tr><td colSpan={6}><div className="empty-state"><Navigation size={32} className="empty-state-icon" /><span className="empty-state-text">Sin registros de ubicación para la vaca seleccionada</span></div></td></tr>
                  ) : locations.map((location) => (
                    <tr key={location.id}><td className="td-mono">#{location.id}</td><td>{location.cowName}</td><td className="td-mono">{location.latitude.toFixed(6)}</td><td className="td-mono">{location.longitude.toFixed(6)}</td><td><span className={`badge ${location.insideGeofence ? 'badge-green' : 'badge-red'}`}>{location.insideGeofence ? 'Dentro' : 'Fuera'}</span></td><td className="td-mono">{formatDateTime(location.recordedAt)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pageData && pageData.totalPages > 1 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Pág. {page + 1} de {pageData.totalPages}</span>
                <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>← Anterior</button>
                <button className="btn btn-secondary btn-sm" disabled={page >= pageData.totalPages - 1} onClick={() => setPage((current) => current + 1)}>Siguiente →</button>
              </div>
            ) : null}
          </>
        )}
      </PageContainer>
    </>
  );
}
