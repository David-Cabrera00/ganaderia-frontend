import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;