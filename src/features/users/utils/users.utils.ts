import type { UserResponse } from '@/types';

export const filterUsers = (items: UserResponse[], term: string) => {
  const query = term.trim().toLowerCase();
  if (!query) return items;
  return items.filter((item) => `${item.name} ${item.email} ${item.role}`.toLowerCase().includes(query));
};
