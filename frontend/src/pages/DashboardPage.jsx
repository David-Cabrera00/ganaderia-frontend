import { dashboardMock, resumenIAMock, alertasMock } from "../data/mockData";
import StatCard from "../components/StatCard";
import {
  FaPaw,
  FaMapMarkedAlt,
  FaExclamationTriangle,
  FaRobot
} from "react-icons/fa";

export default function DashboardPage() {
  const ultimasAlertas = alertasMock.slice(0, 3);

  return (
    <div className="container-fluid p-4 text-white">
      <div className="mb-4">
        <h2 className="fw-bold">Panel General</h2>
        <p className="text-light mb-0">
          Bienvenido al sistema inteligente de monitoreo ganadero.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-md-3">
          <StatCard
            title="Vacas monitoreadas"
            value={dashboardMock.vacasMonitoreadas}
            icon={<FaPaw />}
            color="bg-success text-white"
          />
        </div>

        <div className="col-md-3">
          <StatCard
            title="Dentro del perímetro"
            value={dashboardMock.dentroPerimetro}
            icon={<FaMapMarkedAlt />}
            color="bg-primary text-white"
          />
        </div>

        <div className="col-md-3">
          <StatCard
            title="Fuera del perímetro"
            value={dashboardMock.fueraPerimetro}
            icon={<FaExclamationTriangle />}
            color="bg-danger text-white"
          />
        </div>

        <div className="col-md-3">
          <StatCard
            title="Alertas activas"
            value={dashboardMock.alertasActivas}
            icon={<FaRobot />}
            color="bg-warning text-dark"
          />
        </div>
      </div>

      <div className="row g-4 mt-2">
        <div className="col-lg-7">
          <div className="card shadow h-100">
            <div className="card-body">
              <h4 className="text-dark mb-3">Resumen del sistema</h4>
              <p className="text-dark">
                El sistema monitorea la ubicación del ganado mediante collares GPS,
                detectando salidas del perímetro y generando alertas automáticas para
                apoyar la toma de decisiones del ganadero.
              </p>

              <div className="mt-4">
                <h5 className="text-dark mb-3">Últimas alertas</h5>
                <div className="table-responsive">
                  <table className="table table-striped table-bordered">
                    <thead className="table-dark">
                      <tr>
                        <th>Vaca</th>
                        <th>Tipo</th>
                        <th>Severidad</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ultimasAlertas.map((alerta) => (
                        <tr key={alerta.id}>
                          <td>{alerta.vaca}</td>
                          <td>{alerta.tipo}</td>
                          <td>{alerta.severidad}</td>
                          <td>{alerta.fecha}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card shadow h-100">
            <div className="card-body">
              <h4 className="text-dark mb-3">Resumen inteligente</h4>

              <p className="text-dark mb-2">
                <strong>Vaca con más alertas:</strong> {resumenIAMock.vacaMasAlertas}
              </p>

              <p className="text-dark mb-2">
                <strong>Cantidad de alertas:</strong> {resumenIAMock.cantidadAlertas}
              </p>

              <p className="text-dark mb-2">
                <strong>Vaca con más salidas:</strong> {resumenIAMock.vacaMasSalidas}
              </p>

              <p className="text-dark mb-2">
                <strong>Cantidad de salidas:</strong> {resumenIAMock.cantidadSalidas}
              </p>

              <hr />

              <h5 className="text-dark">Recomendación</h5>
              <p className="text-dark mb-0">
                {resumenIAMock.recomendacion}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}