import type { AlertResponse } from '@/types';

export const countPendingAlerts = (items: AlertResponse[]) => items.filter((item) => item.status === 'PENDIENTE').length;
