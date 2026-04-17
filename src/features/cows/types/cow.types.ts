export type CowStatus = "DENTRO" | "FUERA" | "INACTIVA";

export interface Cow {
  id: number;
  name: string;
  token: string;
  internalCode: string;
  latitude?: number;
  longitude?: number;
  status: CowStatus;
  collarId?: number | null;
  geofenceId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCowRequest {
  name: string;
  token: string;
  internalCode: string;
  latitude?: number;
  longitude?: number;
  status: CowStatus;
  collarId?: number | null;
  geofenceId?: number | null;
}

export interface UpdateCowRequest {
  name: string;
  token: string;
  internalCode: string;
  latitude?: number;
  longitude?: number;
  status: CowStatus;
  collarId?: number | null;
  geofenceId?: number | null;
}

export interface CowFormValues {
  name: string;
  token: string;
  internalCode: string;
  latitude?: number;
  longitude?: number;
  status: CowStatus;
  collarId?: number | null;
  geofenceId?: number | null;
}