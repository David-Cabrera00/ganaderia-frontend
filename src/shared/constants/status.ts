import type {
  AlertStatus,
  AlertType,
  CollarStatus,
  CowStatus,
  DeviceSignalStatus,
} from '@/types';

export const COW_STATUS_LABELS: Record<CowStatus, string> = {
  SIN_UBICACION: 'Sin ubicación',
  DENTRO: 'Dentro',
  FUERA: 'Fuera',
};

export const COW_STATUS_COLORS: Record<CowStatus, string> = {
  SIN_UBICACION: 'badge-gray',
  DENTRO: 'badge-green',
  FUERA: 'badge-red',
};

export const COLLAR_STATUS_LABELS: Record<CollarStatus, string> = {
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
  MANTENIMIENTO: 'Mantenimiento',
};

export const COLLAR_STATUS_COLORS: Record<CollarStatus, string> = {
  ACTIVO: 'badge-green',
  INACTIVO: 'badge-gray',
  MANTENIMIENTO: 'badge-yellow',
};

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  EXIT_GEOFENCE: 'Salida de geocerca',
  COLLAR_OFFLINE: 'Collar sin señal',
};

export const ALERT_STATUS_LABELS: Record<AlertStatus, string> = {
  PENDIENTE: 'Pendiente',
  RESUELTA: 'Resuelta',
  DESCARTADA: 'Descartada',
};

export const ALERT_STATUS_COLORS: Record<AlertStatus, string> = {
  PENDIENTE: 'badge-red',
  RESUELTA: 'badge-green',
  DESCARTADA: 'badge-gray',
};

export const SIGNAL_STATUS_LABELS: Record<DeviceSignalStatus, string> = {
  FUERTE: 'Fuerte',
  MEDIA: 'Media',
  DEBIL: 'Débil',
  SIN_SENAL: 'Sin señal',
};
