const Topbar = () => {
  return (
    <header
      style={{
        height: "72px",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
      }}
    >
      <div>
        <strong>Panel administrativo</strong>
      </div>

      <div>
        <span>Bienvenido</span>
      </div>
    </header>
  );
};

export default Topbar;