import type { LocationResponse } from '@/types';

export const latestLocation = (items: LocationResponse[]) => [...items].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0] ?? null;
