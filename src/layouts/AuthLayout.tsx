import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background:
          "linear-gradient(135deg, #111827 0%, #1f2937 35%, #374151 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "#ffffff",
          borderRadius: "18px",
          padding: "32px",
          boxShadow: "0 18px 40px rgba(0, 0, 0, 0.18)",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;