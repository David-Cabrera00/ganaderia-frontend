import { useAuthStore } from "../../app/store/authStore";

const Topbar = () => {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  return (
    <header
      style={{
        height: "72px",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        backgroundColor: "#ffffff",
      }}
    >
      <div>
        <strong>Panel administrativo</strong>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span>{user?.name ?? "Usuario"}</span>
        <button onClick={clearSession}>Cerrar sesión</button>
      </div>
    </header>
  );
};

export default Topbar;