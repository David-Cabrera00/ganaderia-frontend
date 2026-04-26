import type { CowResponse } from '@/types';

export const sortCowsByName = (items: CowResponse[]) => [...items].sort((a, b) => a.name.localeCompare(b.name));
