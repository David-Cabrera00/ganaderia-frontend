import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { obtenerVacas, crearVaca } from "../services/cowService";

export default function VacasPage() {
  const [vacas, setVacas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    raza: "",
    edad: "",
    estado: ""
  });

  const cargarVacas = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await obtenerVacas();

      const vacasMapeadas = data.map((cow) => ({
        id: cow.id,
        codigo: cow.identifier || cow.internalCode || "",
        nombre: cow.name || "",
        raza: extraerRaza(cow.observations),
        edad: extraerEdad(cow.observations),
        estado: cow.status || ""
      }));

      setVacas(vacasMapeadas);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "No se pudieron cargar las vacas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVacas();
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
        internalCode: formData.codigo,
        name: formData.nombre,
        status: formData.estado,
        observations: `Raza: ${formData.raza}, Edad: ${formData.edad}`
      };

      await crearVaca(payload);

      setSuccess("Vaca registrada correctamente.");

      setFormData({
        codigo: "",
        nombre: "",
        raza: "",
        edad: "",
        estado: ""
      });

      await cargarVacas();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "No se pudo registrar la vaca.");
    } finally {
      setSaving(false);
    }
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case "ACTIVA":
        return "badge bg-success";
      case "MONITOREO":
        return "badge bg-warning text-dark";
      case "ALERTA":
        return "badge bg-danger";
      case "DENTRO":
        return "badge bg-primary";
      case "FUERA":
        return "badge bg-dark";
      default:
        return "badge bg-secondary";
    }
  };

  return (
      <div className="container-fluid p-4 text-white" style={{ flex: 1 }}>
        <div className="mb-4">
          <h2 className="fw-bold section-title">Gestión de Vacas</h2>
          <p className="text-light mb-0">
            Registro y control del ganado monitoreado por el sistema.
          </p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card shadow h-100">
              <div className="card-body">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <FaPlus className="text-success" />
                  <h4 className="mb-0 text-dark">Registrar Vaca</h4>
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
                    <label className="form-label text-dark">Nombre</label>
                    <input
                        type="text"
                        className="form-control"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-dark">Raza</label>
                    <input
                        type="text"
                        className="form-control"
                        name="raza"
                        value={formData.raza}
                        onChange={handleChange}
                        required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-dark">Edad</label>
                    <input
                        type="number"
                        className="form-control"
                        name="edad"
                        value={formData.edad}
                        onChange={handleChange}
                        required
                        min="0"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-dark">Estado</label>
                    <select
                        className="form-select"
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        required
                    >
                      <option value="">Seleccione</option>
                      <option value="ACTIVA">Activa</option>
                      <option value="MONITOREO">Monitoreo</option>
                      <option value="ALERTA">Alerta</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-success w-100" disabled={saving}>
                    {saving ? "Guardando..." : "Guardar vaca"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card shadow h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="mb-0 text-dark">Listado de Vacas</h4>
                  <span className="badge bg-primary">Total: {vacas.length}</span>
                </div>

                {loading ? (
                    <p className="text-dark">Cargando vacas...</p>
                ) : vacas.length === 0 ? (
                    <p className="text-dark">No hay vacas registradas.</p>
                ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead className="table-dark">
                        <tr>
                          <th>ID</th>
                          <th>Código</th>
                          <th>Nombre</th>
                          <th>Raza</th>
                          <th>Edad</th>
                          <th>Estado</th>
                        </tr>
                        </thead>
                        <tbody>
                        {vacas.map((vaca) => (
                            <tr key={vaca.id}>
                              <td>{vaca.id}</td>
                              <td>{vaca.codigo}</td>
                              <td>{vaca.nombre}</td>
                              <td>{vaca.raza}</td>
                              <td>{vaca.edad}</td>
                              <td>
                            <span className={getEstadoBadge(vaca.estado)}>
                              {vaca.estado}
                            </span>
                              </td>
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

function extraerRaza(observations) {
  if (!observations) return "";
  const match = observations.match(/Raza:\s*([^,]+)/i);
  return match ? match[1].trim() : "";
}

function extraerEdad(observations) {
  if (!observations) return "";
  const match = observations.match(/Edad:\s*([^,]+)/i);
  return match ? match[1].trim() : "";
}