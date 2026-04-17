import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div style={{ padding: "32px" }}>
      <h1>Página no encontrada</h1>
      <p>La ruta que intentas abrir no existe.</p>
      <Link to="/">Volver al dashboard</Link>
    </div>
  );
};

export default NotFoundPage;