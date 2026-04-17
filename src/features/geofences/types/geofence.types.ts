export type GeofenceStatus = "ACTIVA" | "INACTIVA";

export interface Geofence {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  status: GeofenceStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGeofenceRequest {
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  status: GeofenceStatus;
}

export interface UpdateGeofenceRequest {
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  status: GeofenceStatus;
}

export interface GeofenceFormValues {
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  status: GeofenceStatus;
}