import { Link } from "react-router-dom";

const UnauthorizedPage = () => {
  return (
    <div style={{ padding: "32px" }}>
      <h1>Acceso no autorizado</h1>
      <p>No tienes permisos para acceder a esta sección.</p>
      <Link to="/">Volver al dashboard</Link>
    </div>
  );
};

export default UnauthorizedPage;