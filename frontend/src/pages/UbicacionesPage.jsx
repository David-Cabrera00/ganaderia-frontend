import { useState } from "react";
import { FaLocationDot, FaSatellite } from "react-icons/fa6";
import { crearUbicacion } from "../services/ubicacionesService";

export default function UbicacionesPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    collarIdentifier: "",
    latitude: "",
    longitude: "",
    timestamp: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setSuccess("");

      const payload = {
        collarIdentifier: formData.collarIdentifier,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        timestamp: formData.timestamp
      };

      await crearUbicacion(payload);

      setSuccess("Ubicación registrada correctamente.");

      setFormData({
        collarIdentifier: "",
        latitude: "",
        longitude: "",
        timestamp: ""
      });
    } catch (err) {
      console.error(err);
      setError("No se pudo registrar la ubicación.");
    }
  };

  return (
    <div className="container-fluid p-4 text-white" style={{ flex: 1 }}>
      <div className="mb-4">
        <h2 className="fw-bold section-title">Ubicaciones GPS</h2>
        <p className="text-light mb-0">
          Registro de posiciones mediante collar GPS.
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card shadow h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 mb-3">
                <FaLocationDot className="text-success" />
                <h4 className="mb-0 text-dark">Registrar Ubicación</h4>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label text-dark">Collar Identifier</label>
                  <input
                    type="text"
                    className="form-control"
                    name="collarIdentifier"
                    value={formData.collarIdentifier}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-dark">Latitud</label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-dark">Longitud</label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label text-dark">Timestamp</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    name="timestamp"
                    value={formData.timestamp}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-success w-100">
                  Guardar ubicación
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card shadow h-100">
            <div className="card-body d-flex flex-column justify-content-center align-items-center text-dark">
              <FaSatellite size={40} className="mb-3 text-primary" />
              <h4>Mapa y tabla siguen visuales por ahora</h4>
              <p className="text-center mb-0">
                Primero conecten el registro real de ubicaciones. Luego cargamos
                historial y mapa desde backend.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}