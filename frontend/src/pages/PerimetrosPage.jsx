import { useEffect, useState } from "react";
import { FaDrawPolygon, FaPlus } from "react-icons/fa6";
import { obtenerGeocercas, crearGeocerca } from "../services/perimetrosService";

export default function PerimetrosPage() {
  const [geocercas, setGeocercas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    centerLatitude: "",
    centerLongitude: "",
    radiusMeters: "",
    active: true,
    cowId: ""
  });

  const cargarGeocercas = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await obtenerGeocercas();

      const geocercasMapeadas = data.map((g) => ({
        id: g.id,
        name: g.name || "",
        centerLatitude: g.centerLatitude || "",
        centerLongitude: g.centerLongitude || "",
        radiusMeters: g.radiusMeters || "",
        active: g.active,
        cowId: g.cowId || "",
        cowIdentifier: g.cowIdentifier || "",
        cowName: g.cowName || ""
      }));

      setGeocercas(geocercasMapeadas);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "No se pudieron cargar las geocercas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarGeocercas();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: formData.name,
        centerLatitude: Number(formData.centerLatitude),
        centerLongitude: Number(formData.centerLongitude),
        radiusMeters: Number(formData.radiusMeters),
        active: formData.active,
        cowId: Number(formData.cowId)
      };

      await crearGeocerca(payload);

      setSuccess("Geocerca registrada correctamente.");

      setFormData({
        name: "",
        centerLatitude: "",
        centerLongitude: "",
        radiusMeters: "",
        active: true,
        cowId: ""
      });

      await cargarGeocercas();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "No se pudo registrar la geocerca.");
    } finally {
      setSaving(false);
    }
  };

  return (
      <div className="container-fluid p-4 text-white" style={{ flex: 1 }}>
        <div className="mb-4">
          <h2 className="fw-bold section-title">Gestión de Geocercas</h2>
          <p className="text-light mb-0">Configuración de zonas circulares.</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card shadow h-100">
              <div className="card-body">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <FaPlus className="text-success" />
                  <h4 className="mb-0 text-dark">Registrar Geocerca</h4>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-dark">Nombre</label>
                    <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-dark">Latitud centro</label>
                    <input
                        type="number"
                        step="any"
                        className="form-control"
                        name="centerLatitude"
                        value={formData.centerLatitude}
                        onChange={handleChange}
                        required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-dark">Longitud centro</label>
                    <input
                        type="number"
                        step="any"
                        className="form-control"
                        name="centerLongitude"
                        value={formData.centerLongitude}
                        onChange={handleChange}
                        required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-dark">Radio (m)</label>
                    <input
                        type="number"
                        className="form-control"
                        name="radiusMeters"
                        value={formData.radiusMeters}
                        onChange={handleChange}
                        required
                        min="1"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-dark">Vaca ID</label>
                    <input
                        type="number"
                        className="form-control"
                        name="cowId"
                        value={formData.cowId}
                        onChange={handleChange}
                        required
                        min="1"
                    />
                  </div>

                  <div className="form-check form-switch mb-4">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        name="active"
                        checked={formData.active}
                        onChange={handleChange}
                    />
                    <label className="form-check-label text-dark">
                      Activa
                    </label>
                  </div>

                  <button type="submit" className="btn btn-success w-100" disabled={saving}>
                    {saving ? "Guardando..." : "Guardar geocerca"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card shadow h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <FaDrawPolygon className="text-primary" />
                    <h4 className="mb-0 text-dark">Listado de Geocercas</h4>
                  </div>
                  <span className="badge bg-primary">Total: {geocercas.length}</span>
                </div>

                {loading ? (
                    <p className="text-dark">Cargando geocercas...</p>
                ) : geocercas.length === 0 ? (
                    <p className="text-dark">No hay geocercas registradas.</p>
                ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead className="table-dark">
                        <tr>
                          <th>ID</th>
                          <th>Nombre</th>
                          <th>Latitud</th>
                          <th>Longitud</th>
                          <th>Radio</th>
                          <th>Activa</th>
                          <th>Vaca ID</th>
                          <th>Identificador Vaca</th>
                          <th>Nombre Vaca</th>
                        </tr>
                        </thead>
                        <tbody>
                        {geocercas.map((g) => (
                            <tr key={g.id}>
                              <td>{g.id}</td>
                              <td>{g.name}</td>
                              <td>{g.centerLatitude}</td>
                              <td>{g.centerLongitude}</td>
                              <td>{g.radiusMeters}</td>
                              <td>
                            <span className={`badge ${g.active ? "bg-success" : "bg-danger"}`}>
                              {g.active ? "Sí" : "No"}
                            </span>
                              </td>
                              <td>{g.cowId}</td>
                              <td>{g.cowIdentifier}</td>
                              <td>{g.cowName}</td>
                            </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}