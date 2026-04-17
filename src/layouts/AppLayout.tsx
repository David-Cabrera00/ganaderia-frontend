import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar"; 
import Topbar from "./components/Topbar";   

const AppLayout = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Topbar />

        <main style={{ padding: "24px", flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;