import { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import type { LatLngExpression, LatLngBoundsExpression } from 'leaflet';
import type { LocationResponse } from '@/types';
import { formatDateTime } from '@/utils/helpers';

interface DashboardOperationsMapProps {
  locations: LocationResponse[];
}

const DEFAULT_CENTER: LatLngExpression = [1.2136, -77.2811];

export function DashboardOperationsMap({ locations }: DashboardOperationsMapProps) {
  const center = useMemo<LatLngExpression>(() => {
    if (locations.length === 0) return DEFAULT_CENTER;
    return [locations[0].latitude, locations[0].longitude];
  }, [locations]);

  const bounds = useMemo<LatLngBoundsExpression | null>(() => {
    if (locations.length === 0) return null;

    return locations.map((location) => [
      location.latitude,
      location.longitude,
    ]) as [number, number][];
  }, [locations]);

  return (
    <section className="card map-shell">
      <div className="card-header">
        <span className="card-title">Mapa operativo</span>
      </div>

      <div className="card-body">
        {locations.length === 0 ? (
          <div className="empty-state">
            <strong>Sin ubicaciones recientes</strong>
            <span className="empty-state-text">
              Aún no hay puntos disponibles para mostrar en el panel.
            </span>
          </div>
        ) : (
          <>
            <div className="map-legend">
              <span><i className="legend-dot legend-dot-blue" /> Dentro de geocerca</span>
              <span><i className="legend-dot legend-dot-red" /> Fuera de geocerca</span>
            </div>

            <MapContainer
              center={center}
              zoom={13}
              scrollWheelZoom={false}
              bounds={bounds ?? undefined}
              className="map-canvas"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />

              {locations.map((location) => {
                const color = location.insideGeofence ? '#5b8cff' : '#ef6b63';

                return (
                  <CircleMarker
                    key={location.id}
                    center={[location.latitude, location.longitude]}
                    radius={7}
                    pathOptions={{
                      color,
                      fillColor: color,
                      fillOpacity: 0.9,
                      weight: 2,
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                      {location.cowName}
                    </Tooltip>

                    <Popup>
                      <strong>{location.cowName}</strong>
                      <br />
                      Estado: {location.insideGeofence ? 'Dentro de geocerca' : 'Fuera de geocerca'}
                      <br />
                      Lat: {location.latitude.toFixed(6)}
                      <br />
                      Lng: {location.longitude.toFixed(6)}
                      <br />
                      Fecha: {formatDateTime(location.recordedAt)}
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </>
        )}
      </div>
    </section>
  );
}
