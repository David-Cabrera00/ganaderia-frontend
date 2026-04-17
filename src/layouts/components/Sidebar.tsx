import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside
      style={{
        width: "260px",
        borderRight: "1px solid #e5e7eb",
        padding: "24px 16px",
      }}
    >
      <h2 style={{ marginBottom: "24px" }}>Ganadería 4.0</h2>

      <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <Link to="/">Dashboard</Link>
        <Link to="/users">Usuarios</Link>
        <Link to="/cows">Vacas</Link>
        <Link to="/collars">Collares</Link>
        <Link to="/geofences">Geocercas</Link>
        <Link to="/alerts">Alertas</Link>
        <Link to="/locations">Ubicaciones</Link>
        <Link to="/reports">Reportes</Link>
      </nav>
    </aside>
  );
};

export default Sidebar;