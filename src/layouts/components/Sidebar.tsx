import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/users", label: "Usuarios" },
  { to: "/cows", label: "Vacas" },
  { to: "/collars", label: "Collares" },
  { to: "/geofences", label: "Geocercas" },
  { to: "/alerts", label: "Alertas" },
  { to: "/locations", label: "Ubicaciones" },
  { to: "/reports", label: "Reportes" },
];

const Sidebar = () => {
  return (
    <aside
      style={{
        width: "260px",
        borderRight: "1px solid #e5e7eb",
        padding: "24px 16px",
        backgroundColor: "#f9fafb",
      }}
    >
      <h2 style={{ marginBottom: "24px" }}>Ganadería 4.0</h2>

      <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              textDecoration: "none",
              padding: "10px 12px",
              borderRadius: "10px",
              color: isActive ? "#ffffff" : "#111827",
              backgroundColor: isActive ? "#111827" : "transparent",
              fontWeight: 600,
            })}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;