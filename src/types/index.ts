// ─── Enums (match backend exactly) ──────────────────────────────────────────

export type Role = 'ADMINISTRADOR' | 'SUPERVISOR' | 'OPERADOR' | 'TECNICO';
export type CowStatus = 'SIN_UBICACION' | 'DENTRO' | 'FUERA';
export type CollarStatus = 'ACTIVO' | 'INACTIVO' | 'MANTENIMIENTO';
export type DeviceSignalStatus = 'FUERTE' | 'MEDIA' | 'DEBIL' | 'SIN_SENAL';
export type AlertType = 'EXIT_GEOFENCE' | 'COLLAR_OFFLINE';
export type AlertStatus = 'PENDIENTE' | 'RESUELTA' | 'DESCARTADA';
export type ApiErrorCode =
  | 'RESOURCE_NOT_FOUND'
  | 'BAD_REQUEST'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'DEVICE_UNAUTHORIZED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR';

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  name: string;
  email: string;
  role: Role;
  token: string;
  tokenType: string;
  expiresIn: number;
  message: string;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}

export interface UserCreateRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
  active?: boolean;
}

// ─── Cow ─────────────────────────────────────────────────────────────────────

export interface CowResponse {
  id: number;
  token: string;
  internalCode: string | null;
  name: string;
  status: CowStatus;
  observations: string | null;
}

export interface CowRequest {
  internalCode?: string;
  name: string;
  status: CowStatus;
  observations?: string;
}

// ─── Collar ──────────────────────────────────────────────────────────────────

export interface CollarResponse {
  id: number;
  token: string;
  status: CollarStatus;
  cowId: number | null;
  cowToken: string | null;
  cowName: string | null;
  batteryLevel: number | null;
  lastSeenAt: string | null;
  signalStatus: DeviceSignalStatus | null;
  firmwareVersion: string | null;
  gpsAccuracy: number | null;
  enabled: boolean;
  notes: string | null;
}

export interface CollarRequest {
  status: CollarStatus;
  cowId?: number;
  batteryLevel?: number;
  lastSeenAt?: string;
  signalStatus?: DeviceSignalStatus;
  firmwareVersion?: string;
  gpsAccuracy?: number;
  enabled?: boolean;
  notes?: string;
}

// ─── Geofence ─────────────────────────────────────────────────────────────────

export interface GeofenceResponse {
  id: number;
  name: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusMeters: number;
  active: boolean;
  cowId: number | null;
  cowToken: string | null;
  cowName: string | null;
}

export interface GeofenceRequest {
  name: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusMeters: number;
  active: boolean;
  cowId?: number;
}

// ─── Alert ───────────────────────────────────────────────────────────────────

export interface AlertResponse {
  id: number;
  type: AlertType;
  message: string;
  createdAt: string;
  status: AlertStatus;
  observations: string | null;
  cowId: number | null;
  cowToken: string | null;
  cowName: string | null;
  locationId: number | null;
}

export interface AlertUpdateRequest {
  status: AlertStatus;
  observations?: string;
}

// ─── Location ─────────────────────────────────────────────────────────────────

export interface LocationResponse {
  id: number;
  cowId: number;
  cowToken: string;
  cowName: string;
  latitude: number;
  longitude: number;
  recordedAt: string;
  insideGeofence: boolean;
}

export interface LocationRequest {
  cowId: number;
  latitude: number;
  longitude: number;
  recordedAt?: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardSummary {
  totalCows: number;
  cowsOutsideGeofence: number;
  totalCollars: number;
  activeCollars: number;
  offlineCollars: number;
  pendingAlerts: number;
  pendingExitGeofenceAlerts: number;
  pendingCollarOfflineAlerts: number;
  latestLocationTimestamp: string | null;
}

// ─── API error ────────────────────────────────────────────────────────────────

export interface ApiError {
  status: number;
  error: string;
  code: ApiErrorCode;
  message: string;
  path: string;
  timestamp: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

// ─── Session (stored in localStorage) ────────────────────────────────────────

export interface SessionData {
  id: number;
  name: string;
  email: string;
  role: Role;
  token: string;
  expiresAt: number; // timestamp ms
}
