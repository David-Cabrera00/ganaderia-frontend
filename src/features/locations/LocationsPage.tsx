import { useEffect, useState, useCallback, type ChangeEvent, type ReactNode } from 'react';
import {
  AlertCircle,
  MapPin,
  Navigation,
  Radar,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { LocationService, CowService, GeofenceService } from '@/api/services';
import { AppError } from '@/api/httpClient';
import { formatDateTime } from '@/utils/helpers';
import type { LocationResponse, CowResponse, Page, GeofenceResponse } from '@/types';
import { PageContainer } from '@/layouts/components/PageContainer';
import { PageHeader } from '@/layouts/components/PageHeader';
import { LocationsMap } from '@/features/locations/components/LocationsMap';

type LocationMetricTone = 'info' | 'success' | 'warning' | 'danger';

interface LocationMetricItem {
  label: string;
  value: string | number;
  helper: string;
  tone: LocationMetricTone;
  icon: ReactNode;
}

const toneLabels: Record<LocationMetricTone, string> = {
  info: 'Monitoreo',
  success: 'Dentro',
  warning: 'Seguimiento',
  danger: 'Fuera',
};

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
      setPageData({
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        number: response.number,
        size: response.size,
        first: response.first,
        last: response.last,
      });
    } catch (err) {
      toast.error(AppError.from(err).serverMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedCowId, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCowChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCowId(event.target.value === '' ? '' : Number(event.target.value));
    setPage(0);
  };

  const selectedCow = selectedCowId
    ? cows.find((cow) => cow.id === selectedCowId) ?? null
    : null;

  const selectedGeofence = selectedCowId
    ? geofences.find((item) => item.cowId === Number(selectedCowId)) ?? null
    : null;

  const insideCount = locations.filter((location) => location.insideGeofence).length;
  const outsideCount = locations.filter((location) => !location.insideGeofence).length;
  const lastRecord = locations[0]?.recordedAt ?? null;
  const totalHistory = pageData?.totalElements ?? 0;

  const metrics: LocationMetricItem[] = [
    {
      label: 'Registros visibles',
      value: locations.length,
      helper: 'Posiciones cargadas en la página actual.',
      tone: 'info',
      icon: <Navigation size={24} />,
    },
    {
      label: 'Dentro de geocerca',
      value: insideCount,
      helper: 'Lecturas dentro del perímetro configurado.',
      tone: 'success',
      icon: <ShieldCheck size={24} />,
    },
    {
      label: 'Fuera de geocerca',
      value: outsideCount,
      helper:
        outsideCount > 0
          ? 'Lecturas que requieren revisión operativa.'
          : 'Sin salidas detectadas en esta página.',
      tone: outsideCount > 0 ? 'danger' : 'success',
      icon: <AlertCircle size={24} />,
    },
    {
      label: 'Última lectura',
      value: lastRecord ? formatDateTime(lastRecord) : 'Sin datos',
      helper: selectedCow
        ? `Historial de ${selectedCow.name}.`
        : 'Selecciona una vaca para cargar su recorrido.',
      tone: 'warning',
      icon: <MapPin size={24} />,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Trazabilidad GPS"
        title="Ubicaciones"
        badge="Historial GPS"
        subtitle="Consulta el recorrido por vaca, revisa entradas y salidas de perímetro y visualiza el contexto geográfico del monitoreo."
      />

      <PageContainer>
        <section className="locations-premium-hero card">
          <div className="locations-premium-hero-copy">
            <span className="locations-premium-eyebrow">
              <Sparkles size={14} />
              Monitoreo geográfico
            </span>

            <h2>Seguimiento GPS del hato y control visual de recorridos</h2>

            <p>
              Selecciona una vaca para consultar su historial de ubicaciones, validar
              si permanece dentro de la geocerca y revisar el comportamiento del recorrido.
            </p>

            <div className="locations-premium-pills">
              <span>
                <Route size={14} />
                {totalHistory} registros
              </span>
              <span>
                <ShieldCheck size={14} />
                {insideCount} dentro
              </span>
              <span>
                <AlertCircle size={14} />
                {outsideCount} fuera
              </span>
            </div>
          </div>

          <div className="locations-premium-hero-card">
            <span>Vaca seleccionada</span>
            <strong>{selectedCow?.name ?? '—'}</strong>
            <small>
              {selectedCow
                ? `Token ${selectedCow.token}`
                : 'Selecciona un animal para iniciar la consulta.'}
            </small>
          </div>
        </section>

        <section className="locations-premium-metrics">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className={`locations-premium-metric locations-premium-metric-${metric.tone}`}
            >
              <div className="locations-premium-metric-glow" />

              <div className="locations-premium-metric-top">
                <div className="locations-premium-metric-icon">{metric.icon}</div>

                <span className="locations-premium-metric-status">
                  <Sparkles size={13} />
                  {toneLabels[metric.tone]}
                </span>
              </div>

              <div className="locations-premium-metric-copy">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <p>{metric.helper}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="card locations-premium-toolbar">
          <div className="locations-premium-toolbar-main">
            <div className="locations-premium-toolbar-title">
              <Search size={18} />

              <div>
                <strong>Consulta de trazabilidad</strong>
                <span>Selecciona una vaca para cargar su historial GPS.</span>
              </div>
            </div>

            <div className="locations-premium-selector">
              <select
                className="form-select locations-premium-select"
                value={selectedCowId}
                onChange={handleCowChange}
                disabled={loadingCows}
              >
                <option value="">Seleccionar vaca...</option>
                {cows.map((cow) => (
                  <option key={cow.id} value={cow.id}>
                    {cow.name} — {cow.token}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="locations-premium-toolbar-note">
            {pageData
              ? `${pageData.totalElements} registros en el historial completo`
              : 'Selecciona una vaca para consultar su trazabilidad'}
          </div>
        </section>

        {selectedCowId ? (
          <div className="locations-premium-map-area">
            <LocationsMap
              locations={locations}
              cowName={selectedCow?.name ?? null}
              geofence={selectedGeofence}
            />
          </div>
        ) : null}

        {!selectedCowId ? (
          <section className="locations-premium-empty card">
            <div className="locations-premium-empty-icon">
              <Radar size={36} />
            </div>

            <strong>Selecciona una vaca para iniciar el seguimiento</strong>

            <span>
              Cuando selecciones un animal, el sistema mostrará su historial GPS,
              estado frente a geocerca y recorrido en el mapa.
            </span>
          </section>
        ) : loading ? (
          <div className="loading-center">
            <div className="loading-spinner" />
          </div>
        ) : (
          <>
            <section className="card locations-premium-table-panel">
              <div className="card-header locations-premium-table-header">
                <div>
                  <span className="card-title">Historial de ubicaciones</span>
                  <p className="locations-premium-section-subtitle">
                    Lecturas GPS registradas para la vaca seleccionada.
                  </p>
                </div>

                {pageData ? (
                  <span className="locations-premium-table-badge">
                    Página {page + 1} de {pageData.totalPages}
                  </span>
                ) : null}
              </div>

              <div className="card-body">
                <div className="locations-premium-table-shell">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Vaca</th>
                        <th>Latitud</th>
                        <th>Longitud</th>
                        <th>Geocerca</th>
                        <th>Registrado</th>
                      </tr>
                    </thead>

                    <tbody>
                      {locations.length === 0 ? (
                        <tr>
                          <td colSpan={6}>
                            <div className="empty-state">
                              <Navigation size={32} className="empty-state-icon" />
                              <span className="empty-state-text">
                                Sin registros de ubicación para la vaca seleccionada.
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        locations.map((location) => (
                          <tr key={location.id}>
                            <td className="td-mono">#{location.id}</td>

                            <td>
                              <span className="locations-cow-chip">
                                {location.cowName}
                              </span>
                            </td>

                            <td className="td-mono">
                              {location.latitude.toFixed(6)}
                            </td>

                            <td className="td-mono">
                              {location.longitude.toFixed(6)}
                            </td>

                            <td>
                              <span
                                className={`locations-status-chip ${
                                  location.insideGeofence
                                    ? 'locations-status-inside'
                                    : 'locations-status-outside'
                                }`}
                              >
                                {location.insideGeofence ? (
                                  <ShieldCheck size={14} />
                                ) : (
                                  <AlertCircle size={14} />
                                )}
                                {location.insideGeofence ? 'Dentro' : 'Fuera'}
                              </span>
                            </td>

                            <td className="td-mono">
                              {formatDateTime(location.recordedAt)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {pageData && pageData.totalPages > 1 ? (
              <div className="locations-premium-pagination">
                <span>
                  Pág. {page + 1} de {pageData.totalPages}
                </span>

                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page === 0}
                  onClick={() => setPage((current) => current - 1)}
                >
                  ← Anterior
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page >= pageData.totalPages - 1}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Siguiente →
                </button>
              </div>
            ) : null}
          </>
        )}
      </PageContainer>
    </>
  );
}