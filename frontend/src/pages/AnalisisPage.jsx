import { resumenIAMock } from "../data/mockData";

export default function AnalisisPage() {
const resumenIA = resumenIAMock;

  return (
    <div className="container-fluid p-4 text-white" style={{ flex: 1 }}>
      <h1 className="mb-4">Análisis Inteligente</h1>

      <div className="row g-3">
        <div className="col-md-4">
          <div className="card bg-danger text-white shadow">
            <div className="card-body">
              <h5 className="card-title">Vaca con más alertas</h5>
              <h3>{resumenIA.vacaMasAlertas}</h3>
              <p className="mb-0">Alertas registradas: {resumenIA.cantidadAlertas}</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-warning text-dark shadow">
            <div className="card-body">
              <h5 className="card-title">Vaca con más salidas</h5>
              <h3>{resumenIA.vacaMasSalidas}</h3>
              <p className="mb-0">Salidas detectadas: {resumenIA.cantidadSalidas}</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-primary text-white shadow">
            <div className="card-body">
              <h5 className="card-title">Alertas analizadas</h5>
              <h3>{resumenIA.totalAlertasAnalizadas}</h3>
              <p className="mb-0">Eventos considerados por el sistema</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-4 shadow">
        <div className="card-body">
          <h4 className="text-dark mb-3">Recomendación generada</h4>
          <p className="text-dark">{resumenIA.recomendacion}</p>
        </div>
      </div>

      <div className="card mt-4 shadow">
        <div className="card-body">
          <h4 className="text-dark mb-3">Interpretación del análisis</h4>
          <p className="text-dark">
            Este módulo realiza un análisis básico de los eventos y alertas generadas
            por el sistema. A partir de estos datos, identifica patrones simples de
            comportamiento irregular y genera una recomendación inicial para apoyar
            la toma de decisiones del ganadero.
          </p>
        </div>
      </div>
    </div>
  );
}