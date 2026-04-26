import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.number().min(0).default(0),
  size: z.number().min(1).max(100).default(10),
});

export const searchSchema = z.object({
  search: z.string().trim().default(''),
});
