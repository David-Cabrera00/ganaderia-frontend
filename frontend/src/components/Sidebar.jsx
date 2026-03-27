import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaBars,
  FaTachometerAlt,
  FaBroadcastTower,
  FaMapMarkerAlt,
  FaDrawPolygon,
  FaExclamationTriangle,
  FaRobot,
  FaPaw
} from "react-icons/fa";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const menuItemClass = ({ isActive }) =>
    `nav-link d-flex align-items-center gap-3 ${isActive ? "bg-primary text-white shadow" : ""}`;

  return (
    <div
      className="text-white d-flex flex-column p-3"
      style={{
        width: collapsed ? "95px" : "270px",
        minHeight: "100vh",
        transition: "all 0.3s ease",
        background: "linear-gradient(180deg, #111827, #0f172a)",
        borderRight: "1px solid rgba(255,255,255,0.08)"
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        {!collapsed && (
          <div>
            <h4 className="mb-0 fw-bold">Ganadería 4.0</h4>
            <small className="text-secondary">Smart Monitoring</small>
          </div>
        )}

        <button
          type="button"
          className="btn btn-sm btn-outline-light"
          onClick={() => setCollapsed(!collapsed)}
        >
          <FaBars />
        </button>
      </div>

      <nav className="nav flex-column gap-2">
        <NavLink to="/dashboard" className={menuItemClass}>
          <FaTachometerAlt />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        <NavLink to="/vacas" className={menuItemClass}>
          <FaPaw />
          {!collapsed && <span>Vacas</span>}
        </NavLink>

        <NavLink to="/collares" className={menuItemClass}>
          <FaBroadcastTower />
          {!collapsed && <span>Collares</span>}
        </NavLink>

        <NavLink to="/ubicaciones" className={menuItemClass}>
          <FaMapMarkerAlt />
          {!collapsed && <span>Ubicaciones</span>}
        </NavLink>

        <NavLink to="/perimetros" className={menuItemClass}>
          <FaDrawPolygon />
          {!collapsed && <span>Perímetros</span>}
        </NavLink>

        <NavLink to="/alertas" className={menuItemClass}>
          <FaExclamationTriangle />
          {!collapsed && <span>Alertas</span>}
        </NavLink>

        <NavLink to="/analisis" className={menuItemClass}>
          <FaRobot />
          {!collapsed && <span>Análisis IA</span>}
        </NavLink>
      </nav>

      {!collapsed && (
        <div className="mt-auto pt-4">
          <div className="glass-panel p-3">
            <small className="text-light d-block fw-semibold">
              Sistema Inteligente
            </small>
            <small className="text-secondary">
              Gestión Ganadera Beta
            </small>
          </div>
        </div>
      )}
    </div>
  );
}