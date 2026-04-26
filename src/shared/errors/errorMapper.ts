import { AppError } from '@/shared/errors/AppError';

export const errorMapper = (error: unknown) => AppError.from(error).serverMessage;
