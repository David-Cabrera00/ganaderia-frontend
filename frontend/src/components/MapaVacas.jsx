import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { ubicacionesMock } from "../data/mockData";

const iconoVerde = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconoRojo = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function MapaVacas() {
  const geocerca = {
    centerLatitude: 1.105638,
    centerLongitude: -77.39517,
    radiusMeters: 150
  };

  return (
    <MapContainer
      center={[geocerca.centerLatitude, geocerca.centerLongitude]}
      zoom={14}
      style={{ height: "400px", width: "100%", borderRadius: "15px" }}
    >
      <TileLayer
        attribution='© OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Circle
        center={[geocerca.centerLatitude, geocerca.centerLongitude]}
        radius={geocerca.radiusMeters}
        pathOptions={{
          color: "#22c55e",
          fillColor: "#22c55e",
          fillOpacity: 0.12,
          weight: 3
        }}
      />

      {ubicacionesMock.map((u) => (
        <Marker
          key={u.id}
          position={[Number(u.latitud), Number(u.longitud)]}
          icon={u.dentroPerimetro ? iconoVerde : iconoRojo}
        >
          <Popup>
            <strong>{u.vaca}</strong>
            <br />
            Estado: {u.dentroPerimetro ? "Dentro del perímetro" : "Fuera del perímetro"}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}