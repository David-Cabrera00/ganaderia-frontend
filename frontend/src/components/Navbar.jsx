import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div
      className="d-flex justify-content-between align-items-center px-4 py-3 bg-white shadow-sm"
      style={{
        borderBottom: "1px solid #e5e7eb",
        minHeight: "82px"
      }}
    >
      <div>
        <h4 className="mb-0 text-dark fw-bold">Sistema Inteligente de Gestión Ganadera 4.0</h4>
        <small className="text-muted">Panel administrativo y monitoreo en tiempo real</small>
      </div>

      <div className="d-flex align-items-center gap-3">
        <div
          className="d-flex align-items-center justify-content-center bg-primary text-white fw-bold"
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%"
          }}
        >
          A
        </div>

        <div className="text-end">
          <div className="fw-semibold text-dark">Administrador</div>
          <small className="text-muted">Sesión activa</small>
        </div>

        <Link to="/" className="btn btn-outline-danger btn-sm">
          Cerrar sesión
        </Link>
      </div>
    </div>
  );
}