import type { GeofenceResponse } from '@/types';

export const countActiveGeofences = (items: GeofenceResponse[]) => items.filter((item) => item.active).length;
