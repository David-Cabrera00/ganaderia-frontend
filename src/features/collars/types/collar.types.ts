export interface Collar {
  id: number;
  token: string;
  status: string;
  batteryLevel?: number;
  signalStrength?: number;
  firmwareVersion?: string;
  cowId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCollarRequest {
  token: string;
  status: string;
  batteryLevel?: number;
  signalStrength?: number;
  firmwareVersion?: string;
  cowId?: number | null;
}

export interface UpdateCollarRequest {
  token: string;
  status: string;
  batteryLevel?: number;
  signalStrength?: number;
  firmwareVersion?: string;
  cowId?: number | null;
}

export interface CollarFormValues {
  token: string;
  status: string;
  batteryLevel?: number;
  signalStrength?: number;
  firmwareVersion?: string;
  cowId?: number | null;
}