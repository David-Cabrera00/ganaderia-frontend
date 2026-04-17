export interface Location {
  id: number;
  cowId?: number | null;
  cowName?: string;
  collarId?: number | null;
  latitude: number;
  longitude: number;
  insideGeofence?: boolean;
  recordedAt?: string;
}

export interface CreateLocationRequest {
  cowId?: number | null;
  collarId?: number | null;
  latitude: number;
  longitude: number;
}

export interface LocationFilterValues {
  cowId?: number | null;
  collarId?: number | null;
}