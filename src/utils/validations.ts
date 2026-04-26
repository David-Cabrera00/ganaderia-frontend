import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'El correo es obligatorio').email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const cowSchema = z.object({
  token: z
    .string()
    .min(1, 'El token es obligatorio')
    .max(50, 'El token no puede superar 50 caracteres')
    .refine((v) => !/\s/.test(v), 'El token no puede contener espacios'),
  name: z.string().min(1, 'El nombre es obligatorio').max(80, 'Máximo 80 caracteres'),
  status: z.enum(['DENTRO', 'FUERA', 'SIN_UBICACION']),
  internalCode: z.string().max(30, 'Máximo 30 caracteres').optional().or(z.literal('')),
  observations: z.string().max(250, 'Máximo 250 caracteres').optional().or(z.literal('')),
});
export type CowFormValues = z.infer<typeof cowSchema>;

export const collarSchema = z.object({
  token: z
    .string()
    .min(1, 'El token del collar es obligatorio')
    .max(50, 'El token no puede superar 50 caracteres')
    .refine((v) => !/\s/.test(v), 'El token no puede contener espacios')
    .refine((v) => /^COL-/i.test(v), 'El token del collar debe iniciar con COL-'),
  status: z.enum(['ACTIVO', 'INACTIVO', 'MANTENIMIENTO']),
  cowId: z.number().optional(),
  batteryLevel: z.number().min(0, 'Mínimo 0').max(100, 'Máximo 100').optional(),
  firmwareVersion: z.string().max(30, 'Máximo 30 caracteres').optional().or(z.literal('')),
  notes: z.string().max(250, 'Máximo 250 caracteres').optional().or(z.literal('')),
  enabled: z.boolean().default(true),
});
export type CollarFormValues = z.infer<typeof collarSchema>;

export const geofenceSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(80, 'Máximo 80 caracteres'),
  centerLatitude: z.number({ invalid_type_error: 'Latitud inválida' }),
  centerLongitude: z.number({ invalid_type_error: 'Longitud inválida' }),
  radiusMeters: z.number({ invalid_type_error: 'Radio inválido' }).min(1, 'El radio debe ser mayor a 0'),
  cowId: z.number().optional(),
  active: z.boolean().default(true),
});
export type GeofenceFormValues = z.infer<typeof geofenceSchema>;

export const userCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(50, 'Máximo 50 caracteres'),

  email: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Correo inválido')
    .refine((v) => !/\s/.test(v), 'El correo no puede contener espacios'),

  role: z.enum(['ADMINISTRADOR', 'SUPERVISOR', 'OPERADOR', 'TECNICO'], {
    errorMap: () => ({ message: 'Debes seleccionar un rol' }),
  }),

  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(50, 'La contraseña no puede superar 50 caracteres')
    .refine((v) => !/\s/.test(v), 'La contraseña no puede contener espacios'),

  active: z.boolean().default(true),
});

export type UserCreateFormValues = z.infer<typeof userCreateSchema>;

// Alias por compatibilidad si otro archivo usa userSchema
export const userSchema = userCreateSchema;
export type UserFormValues = UserCreateFormValues;