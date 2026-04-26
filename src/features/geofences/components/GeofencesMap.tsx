import { useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Circle,
  CircleMarker,
  Popup,
  Tooltip,
  useMap,
} from 'react-leaflet';
import type { LatLngExpression, LatLngBoundsExpression } from 'leaflet';
import type { GeofenceResponse } from '@/types';

interface GeofencesMapProps {
  geofences: GeofenceResponse[];
  selectedGeofenceId: number | null;
  onSelect: (id: number) => void;
}

const DEFAULT_CENTER: LatLngExpression = [1.2136, -77.2811];

function MapFocus({
  geofences,
  selectedGeofenceId,
}: {
  geofences: GeofenceResponse[];
  selectedGeofenceId: number | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedGeofenceId) {
      const selected = geofences.find((item) => item.id === selectedGeofenceId);
      if (selected) {
        map.setView([selected.centerLatitude, selected.centerLongitude], 15, {
          animate: true,
        });
        return;
      }
    }

    if (geofences.length > 0) {
      const bounds: LatLngBoundsExpression = geofences.map((geofence) => [
        geofence.centerLatitude,
        geofence.centerLongitude,
      ]) as [number, number][];
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [map, geofences, selectedGeofenceId]);

  return null;
}

export function GeofencesMap({
  geofences,
  selectedGeofenceId,
  onSelect,
}: GeofencesMapProps) {
  const center = useMemo<LatLngExpression>(() => {
    if (selectedGeofenceId) {
      const selected = geofences.find((item) => item.id === selectedGeofenceId);
      if (selected) return [selected.centerLatitude, selected.centerLongitude];
    }

    if (geofences.length === 0) return DEFAULT_CENTER;

    const avgLat =
      geofences.reduce((sum, geofence) => sum + geofence.centerLatitude, 0) /
      geofences.length;

    const avgLng =
      geofences.reduce((sum, geofence) => sum + geofence.centerLongitude, 0) /
      geofences.length;

    return [avgLat, avgLng];
  }, [geofences, selectedGeofenceId]);

  return (
    <section className="card map-shell">
      <div className="card-header">
        <span className="card-title">
          Mapa de geocercas
          {selectedGeofenceId ? ' · foco seleccionado' : ''}
        </span>
      </div>

      <div className="card-body">
        {geofences.length === 0 ? (
          <div className="empty-state">
            <strong>Sin geocercas para mostrar</strong>
            <span className="empty-state-text">
              Crea o carga geocercas para visualizarlas en el mapa.
            </span>
          </div>
        ) : (
          <>
            <div className="map-legend">
              <span><i className="legend-dot legend-dot-blue" /> Activa</span>
              <span><i className="legend-dot legend-dot-gray" /> Inactiva</span>
              <span><i className="legend-dot legend-dot-gold" /> Seleccionada</span>
            </div>

            <MapContainer
              center={center}
              zoom={14}
              scrollWheelZoom={false}
              className="map-canvas"
            >
              <MapFocus
                geofences={geofences}
                selectedGeofenceId={selectedGeofenceId}
              />

              <TileLayer
                attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />

              {geofences.map((geofence) => {
                const isSelected = selectedGeofenceId === geofence.id;

                const color = isSelected
                  ? '#d6b36a'
                  : geofence.active
                  ? '#5b8cff'
                  : '#7f8da8';

                const fillOpacity = isSelected ? 0.18 : geofence.active ? 0.1 : 0.06;
                const weight = isSelected ? 3.5 : 2.4;

                return (
                  <div key={geofence.id}>
                    <Circle
                      center={[geofence.centerLatitude, geofence.centerLongitude]}
                      radius={geofence.radiusMeters}
                      pathOptions={{
                        color,
                        fillColor: color,
                        fillOpacity,
                        weight,
                      }}
                      eventHandlers={{
                        click: () => onSelect(geofence.id),
                      }}
                    />

                    <CircleMarker
                      center={[geofence.centerLatitude, geofence.centerLongitude]}
                      radius={isSelected ? 9 : 7}
                      pathOptions={{
                        color,
                        fillColor: '#ffffff',
                        fillOpacity: 1,
                        weight: 3,
                      }}
                      eventHandlers={{
                        click: () => onSelect(geofence.id),
                      }}
                    >
                      <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                        {geofence.name}
                      </Tooltip>

                      <Popup>
                        <strong>{geofence.name}</strong>
                        <br />
                        Radio: {geofence.radiusMeters} m
                        <br />
                        Estado: {geofence.active ? 'Activa' : 'Inactiva'}
                        <br />
                        Vaca asignada: {geofence.cowName ?? 'Sin asignar'}
                      </Popup>
                    </CircleMarker>
                  </div>
                );
              })}
            </MapContainer>
          </>
        )}
      </div>
    </section>
  );
}
