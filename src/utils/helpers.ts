import type {
  AlertStatus,
  AlertType,
  CollarStatus,
  CowStatus,
  DeviceSignalStatus,
  Role,
} from '../types';
import { ROLE_LABELS } from '@/shared/constants/roles';
import {
  ALERT_STATUS_COLORS,
  ALERT_STATUS_LABELS,
  ALERT_TYPE_LABELS,
  COLLAR_STATUS_COLORS,
  COLLAR_STATUS_LABELS,
  COW_STATUS_COLORS,
  COW_STATUS_LABELS,
  SIGNAL_STATUS_LABELS,
} from '@/shared/constants/status';
import { formatDate, formatDateTime } from '@/shared/utils/formatDate';

export {
  ROLE_LABELS,
  COW_STATUS_LABELS,
  COW_STATUS_COLORS,
  COLLAR_STATUS_LABELS,
  COLLAR_STATUS_COLORS,
  ALERT_TYPE_LABELS,
  ALERT_STATUS_LABELS,
  ALERT_STATUS_COLORS,
  SIGNAL_STATUS_LABELS,
  formatDate,
  formatDateTime,
};

export const formatBattery = (level: number | null): string => {
  if (level === null || level === undefined) return '—';
  return `${level}%`;
};

export const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return 'Ocurrió un error inesperado';
};

export type { Role, CowStatus, CollarStatus, AlertType, AlertStatus, DeviceSignalStatus };
