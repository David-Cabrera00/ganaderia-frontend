export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    me: '/api/auth/me',
  },
  cows: {
    base: '/api/cows',
    byId: (id: number) => `/api/cows/${id}`,
  },
  collars: {
    base: '/api/collars',
    byId: (id: number) => `/api/collars/${id}`,
    enable: (id: number) => `/api/collars/${id}/enable`,
    disable: (id: number) => `/api/collars/${id}/disable`,
    assign: (id: number, cowId: number) => `/api/collars/${id}/assign/${cowId}`,
  },
  geofences: {
    base: '/api/geofences',
    byId: (id: number) => `/api/geofences/${id}`,
  },
  locations: {
    base: '/api/locations',
    byCow: (cowId: number) => `/api/locations/cow/${cowId}`,
    lastByCow: (cowId: number) => `/api/locations/cow/${cowId}/last`,
  },
  alerts: {
    base: '/api/alerts',
    page: '/api/alerts/page',
    byId: (id: number) => `/api/alerts/${id}`,
    resolve: (id: number) => `/api/alerts/${id}/resolve`,
    discard: (id: number) => `/api/alerts/${id}/discard`,
  },
  dashboard: {
    summary: '/api/dashboard/summary',
    criticalAlerts: '/api/dashboard/critical-alerts',
    collarsOffline: '/api/dashboard/collars-offline',
    cowsOutside: '/api/dashboard/cows-outside-geofence',
    recentLocations: '/api/dashboard/recent-locations',
  },
  reports: {
    alerts: '/api/reports/alerts',
    offlineCollars: '/api/reports/offline-collars',
    cowsMostIncidents: '/api/reports/cows-most-incidents',
  },
  users: {
    base: '/api/users',
    byId: (id: number) => `/api/users/${id}`,
    byActive: (active: boolean) => `/api/users/active/${active}`,
  },
} as const;