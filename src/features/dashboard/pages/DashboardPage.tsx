import { useEffect, useState } from "react";
import {
  getCriticalAlerts,
  getDashboardSummary,
  getOfflineCollars,
  getRecentLocations,
} from "../api/dashboardApi";
import type {
  CriticalAlert,
  DashboardSummary,
  OfflineCollar,
  RecentLocation,
} from "../types/dashboard.types";

const DashboardPage = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [alerts, setAlerts] = useState<CriticalAlert[]>([]);
  const [offlineCollars, setOfflineCollars] = useState<OfflineCollar[]>([]);
  const [recentLocations, setRecentLocations] = useState<RecentLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [summaryData, alertsData, offlineData, locationsData] =
          await Promise.all([
            getDashboardSummary(),
            getCriticalAlerts(),
            getOfflineCollars(),
            getRecentLocations(),
          ]);

        setSummary(summaryData);
        setAlerts(alertsData);
        setOfflineCollars(offlineData);
        setRecentLocations(locationsData);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  if (isLoading) {
    return <p>Cargando dashboard...</p>;
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <section>
        <h2>Resumen</h2>
        <ul>
          <li>Total vacas: {summary?.totalCows ?? 0}</li>
          <li>Total collares: {summary?.totalCollars ?? 0}</li>
          <li>Alertas activas: {summary?.activeAlerts ?? 0}</li>
          <li>Vacas fuera de geocerca: {summary?.cowsOutsideGeofence ?? 0}</li>
        </ul>
      </section>

      <section>
        <h2>Alertas críticas</h2>
        {alerts.length === 0 ? (
          <p>No hay alertas críticas.</p>
        ) : (
          <ul>
            {alerts.map((alert) => (
              <li key={alert.id}>
                {alert.message} - {alert.severity}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Collares sin conexión</h2>
        {offlineCollars.length === 0 ? (
          <p>No hay collares fuera de línea.</p>
        ) : (
          <ul>
            {offlineCollars.map((collar) => (
              <li key={collar.id}>{collar.token}</li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Ubicaciones recientes</h2>
        {recentLocations.length === 0 ? (
          <p>No hay ubicaciones recientes.</p>
        ) : (
          <ul>
            {recentLocations.map((location) => (
              <li key={location.id}>
                {location.cowName}: {location.latitude}, {location.longitude}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;