import { z } from 'zod';

export const optionalTrimmedString = z
  .string()
  .transform((value) => value.trim())
  .optional();

export { z };
