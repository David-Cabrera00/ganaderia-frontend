export interface DashboardSummary {
  totalCows: number;
  totalCollars: number;
  activeAlerts: number;
  cowsOutsideGeofence: number;
}

export interface CriticalAlert {
  id: number;
  message: string;
  severity: string;
  createdAt?: string;
}

export interface OfflineCollar {
  id: number;
  token: string;
  batteryLevel?: number;
  lastConnectionAt?: string;
}

export interface RecentLocation {
  id: number;
  cowName: string;
  latitude: number;
  longitude: number;
  recordedAt?: string;
}