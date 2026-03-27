import { useEffect, useState } from "react";
import { FaSatelliteDish, FaPlus } from "react-icons/fa6";
import { obtenerCollares, crearCollar } from "../services/collaresService";

export default function CollaresPage() {
  const [collares, setCollares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    codigo: "",
    estado: "",
    cowId: ""
  });

  const cargarCollares = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await obtenerCollares();

      const collaresMapeados = data.map((collar) => ({
        id: collar.id,
        codigo: collar.identifier || "",
        estado: collar.status || "",
        cowId: collar.cowId || "",
        cowIdentifier: collar.cowIdentifier || "",
        cowName: collar.cowName || ""
      }));

      setCollares(collaresMapeados);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "No se pudieron cargar los collares.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCollares();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        identifier: formData.codigo,
        status: formData.estado,
        cowId: Number(formData.cowId)
      };

      await crearCollar(payload);

      setSuccess("Collar registrado correctamente.");

      setFormData({
        codigo: "",
        estado: "",
        cowId: ""
      });

      await cargarCollares();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "No se pudo registrar el collar.");
    } finally {
      setSaving(false);
    }
  };

  const badgeEstado = (estado) => {
    switch (estado) {
      case "ACTIVO":
        return "badge bg-success";
      case "MONITOREO":
        return "badge bg-warning text-dark";
      case "INACTIVO":
        return "badge bg-danger";
      default:
        return "badge bg-secondary";
    }
  };

  return (
      <div className="container-fluid p-4 text-white" style={{ flex: 1 }}>
        <div className="mb-4">
          <h2 className="fw-bold section-title">Gestión de Collares</h2>
          <p className="text-light mb-0">Administración de dispositivos GPS.</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card shadow h-100">
              <div className="card-body">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <FaPlus className="text-success" />
                  <h4 className="mb-0 text-dark">Registrar Collar</h4>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-dark">Código</label>
                    <input
                        type="text"
                        className="form-control"
                        name="codigo"
                        value={formData.codigo}
                        onChange={handleChange}
                        required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-dark">Estado</label>
                    <select
                        className="form-select"
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        required
                    >
                      <option value="">Seleccione</option>
                      <option value="ACTIVO">Activo</option>
                      <option value="MONITOREO">Monitoreo</option>
                      <option value="INACTIVO">Inactivo</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-dark">ID de la vaca</label>
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

                  <button type="submit" className="btn btn-success w-100" disabled={saving}>
                    {saving ? "Guardando..." : "Guardar collar"}
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
                    <FaSatelliteDish className="text-primary" />
                    <h4 className="mb-0 text-dark">Listado de Collares</h4>
                  </div>
                  <span className="badge bg-primary">Total: {collares.length}</span>
                </div>

                {loading ? (
                    <p className="text-dark">Cargando collares...</p>
                ) : collares.length === 0 ? (
                    <p className="text-dark">No hay collares registrados.</p>
                ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead className="table-dark">
                        <tr>
                          <th>ID</th>
                          <th>Código</th>
                          <th>Estado</th>
                          <th>Vaca ID</th>
                          <th>Identificador Vaca</th>
                          <th>Nombre Vaca</th>
                        </tr>
                        </thead>
                        <tbody>
                        {collares.map((collar) => (
                            <tr key={collar.id}>
                              <td>{collar.id}</td>
                              <td>{collar.codigo}</td>
                              <td>
                            <span className={badgeEstado(collar.estado)}>
                              {collar.estado}
                            </span>
                              </td>
                              <td>{collar.cowId}</td>
                              <td>{collar.cowIdentifier}</td>
                              <td>{collar.cowName}</td>
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