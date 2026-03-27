import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import VacasPage from "./pages/VacasPage";
import AlertasPage from "./pages/AlertasPage";
import UbicacionesPage from "./pages/UbicacionesPage";
import PerimetrosPage from "./pages/PerimetrosPage";
import AnalisisPage from "./pages/AnalisisPage";
import CollaresPage from "./pages/CollaresPage";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

function Layout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0f172a" }}>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Navbar />
        <div style={{ flex: 1, padding: "10px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
        <Route path="/vacas" element={<Layout><VacasPage /></Layout>} />
        <Route path="/alertas" element={<Layout><AlertasPage /></Layout>} />
        <Route path="/ubicaciones" element={<Layout><UbicacionesPage /></Layout>} />
        <Route path="/perimetros" element={<Layout><PerimetrosPage /></Layout>} />
        <Route path="/analisis" element={<Layout><AnalisisPage /></Layout>} />
        <Route path="/collares" element={<Layout><CollaresPage /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}