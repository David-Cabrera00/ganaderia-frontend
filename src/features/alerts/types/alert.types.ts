export type AlertStatus = "PENDIENTE" | "RESUELTA" | "CANCELADA";

export interface Alert {
  id: number;
  message: string;
  type: string;
  status: AlertStatus;
  cowId?: number | null;
  collarId?: number | null;
  createdAt?: string;
  resolvedAt?: string | null;
}

export interface CreateAlertRequest {
  message: string;
  type: string;
  status: AlertStatus;
  cowId?: number | null;
  collarId?: number | null;
}

export interface ResolveAlertRequest {
  status: AlertStatus;
}

export interface AlertFormValues {
  message: string;
  type: string;
  status: AlertStatus;
  cowId?: number | null;
  collarId?: number | null;
}