import { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa6";
import { obtenerAlertas } from "../services/alertasService";

export default function AlertasPage() {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarAlertas = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await obtenerAlertas();
      setAlertas(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las alertas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAlertas();
  }, []);

  return (
    <div className="container-fluid p-4 text-white" style={{ flex: 1 }}>
      <div className="mb-4">
        <h2 className="fw-bold section-title">Gestión de Alertas</h2>
        <p className="text-light mb-0">
          Consulta de alertas generadas automáticamente por el sistema.
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow">
        <div className="card-body">
          <div className="d-flex align-items-center gap-2 mb-3">
            <FaBell className="text-primary" />
            <h4 className="mb-0 text-dark">Listado de Alertas</h4>
          </div>

          {loading ? (
            <p className="text-dark">Cargando alertas...</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Mensaje</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {alertas.map((alerta) => (
                    <tr key={alerta.id}>
                      <td>{alerta.id}</td>
                      <td>{alerta.message || alerta.mensaje || "Sin mensaje"}</td>
                      <td>{alerta.createdAt || alerta.fecha || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}