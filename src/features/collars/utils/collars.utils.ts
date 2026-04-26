import type { CollarResponse } from '@/types';

export const countOfflineCollars = (items: CollarResponse[]) => items.filter((item) => item.signalStatus === 'SIN_SENAL' || !item.enabled).length;
