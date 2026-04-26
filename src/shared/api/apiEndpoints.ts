export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    me: '/auth/me',
  },
  users: '/users',
  cows: '/cows',
  collars: '/collars',
  geofences: '/geofences',
  alerts: '/alerts',
  locations: '/locations',
  reports: '/reports',
} as const;
