import { useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
  Circle,
  Tooltip,
} from 'react-leaflet';
import type { LatLngExpression, LatLngBoundsExpression } from 'leaflet';
import type { LocationResponse, GeofenceResponse } from '@/types';
import { formatDateTime } from '@/utils/helpers';

interface LocationsMapProps {
  locations: LocationResponse[];
  cowName?: string | null;
  geofence?: GeofenceResponse | null;
}

const DEFAULT_CENTER: LatLngExpression = [1.2136, -77.2811];

export function LocationsMap({ locations, cowName, geofence }: LocationsMapProps) {
  const center = useMemo<LatLngExpression>(() => {
    if (locations.length > 0) {
      return [locations[0].latitude, locations[0].longitude];
    }

    if (geofence) {
      return [geofence.centerLatitude, geofence.centerLongitude];
    }

    return DEFAULT_CENTER;
  }, [locations, geofence]);

  const polylinePositions = useMemo<LatLngExpression[]>(
    () =>
      [...locations]
        .reverse()
        .map((location) => [location.latitude, location.longitude] as LatLngExpression),
    [locations],
  );

  const bounds = useMemo<LatLngBoundsExpression | null>(() => {
    const points: [number, number][] = [];

    locations.forEach((location) => {
      points.push([location.latitude, location.longitude]);
    });

    if (geofence) {
      points.push([geofence.centerLatitude, geofence.centerLongitude]);
    }

    return points.length > 0 ? points : null;
  }, [locations, geofence]);

  return (
    <section className="card map-shell">
      <div className="card-header">
        <span className="card-title">
          Mapa de ubicaciones{cowName ? ` · ${cowName}` : ''}
        </span>
      </div>

      <div className="card-body">
        {locations.length === 0 && !geofence ? (
          <div className="empty-state">
            <strong>Sin datos para mostrar</strong>
            <span className="empty-state-text">
              Selecciona una vaca con historial o geocerca asignada.
            </span>
          </div>
        ) : (
          <>
            <div className="map-legend">
              <span><i className="legend-dot legend-dot-blue" /> Dentro de geocerca</span>
              <span><i className="legend-dot legend-dot-red" /> Fuera de geocerca</span>
              <span><i className="legend-dot legend-dot-gold" /> Última ubicación</span>
              <span><i className="legend-dot legend-dot-outline" /> Perímetro</span>
            </div>

            <MapContainer
              center={center}
              zoom={15}
              scrollWheelZoom={false}
              bounds={bounds ?? undefined}
              className="map-canvas"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />

              {geofence ? (
                <>
                  <Circle
                    center={[geofence.centerLatitude, geofence.centerLongitude]}
                    radius={geofence.radiusMeters}
                    pathOptions={{
                      color: '#5b8cff',
                      fillColor: '#5b8cff',
                      fillOpacity: 0.08,
                      weight: 2.5,
                    }}
                  />
                  <CircleMarker
                    center={[geofence.centerLatitude, geofence.centerLongitude]}
                    radius={7}
                    pathOptions={{
                      color: '#5b8cff',
                      fillColor: '#ffffff',
                      fillOpacity: 1,
                      weight: 3,
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                      Centro de geocerca
                    </Tooltip>
                    <Popup>
                      <strong>{geofence.name}</strong>
                      <br />
                      Radio: {geofence.radiusMeters} m
                      <br />
                      Estado: {geofence.active ? 'Activa' : 'Inactiva'}
                    </Popup>
                  </CircleMarker>
                </>
              ) : null}

              {polylinePositions.length > 1 ? (
                <Polyline
                  positions={polylinePositions}
                  pathOptions={{ color: '#d6b36a', weight: 3 }}
                />
              ) : null}

              {locations.map((location, index) => {
                const isLatest = index === 0;
                const color = isLatest
                  ? '#d6b36a'
                  : location.insideGeofence
                    ? '#5b8cff'
                    : '#ef6b63';

                return (
                  <CircleMarker
                    key={location.id}
                    center={[location.latitude, location.longitude]}
                    radius={isLatest ? 10 : 7}
                    pathOptions={{
                      color,
                      fillColor: color,
                      fillOpacity: 0.9,
                      weight: isLatest ? 3 : 2,
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                      {isLatest
                        ? 'Última ubicación'
                        : location.insideGeofence
                          ? 'Dentro de geocerca'
                          : 'Fuera de geocerca'}
                    </Tooltip>

                    <Popup>
                      <strong>{location.cowName}</strong>
                      <br />
                      Lat: {location.latitude.toFixed(6)}
                      <br />
                      Lng: {location.longitude.toFixed(6)}
                      <br />
                      Estado: {location.insideGeofence ? 'Dentro de geocerca' : 'Fuera de geocerca'}
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
