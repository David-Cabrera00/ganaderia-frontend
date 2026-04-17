import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

const AppLayout = () => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
      }}
    >
      <Sidebar />

      <div style={{ display: "flex", flexDirection: "column" }}>
        <Topbar />

        <main
          style={{
            padding: "24px",
            display: "grid",
            gap: "24px",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;