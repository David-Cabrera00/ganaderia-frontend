import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'El correo es obligatorio').email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const cowSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(80, 'Máximo 80 caracteres'),
  status: z.enum(['DENTRO', 'FUERA', 'SIN_UBICACION']),
  internalCode: z.string().max(30, 'Máximo 30 caracteres').optional().or(z.literal('')),
  observations: z.string().max(250, 'Máximo 250 caracteres').optional().or(z.literal('')),
});
export type CowFormValues = z.infer<typeof cowSchema>;

export const collarSchema = z.object({
  status: z.enum(['ACTIVO', 'INACTIVO', 'MANTENIMIENTO'], {
    errorMap: () => ({ message: 'Debes seleccionar un estado' }),
  }),

  cowId: z.number().optional(),

  batteryLevel: z
    .number({
      required_error: 'El nivel de batería es obligatorio',
      invalid_type_error: 'El nivel de batería debe ser un número',
    })
    .min(0, 'La batería no puede ser menor a 0')
    .max(100, 'La batería no puede ser mayor a 100'),

  firmwareVersion: z
    .string()
    .trim()
    .min(1, 'El firmware es obligatorio')
    .max(30, 'Máximo 30 caracteres'),

  notes: z.string().max(250, 'Máximo 250 caracteres').optional().or(z.literal('')),

  enabled: z.boolean().default(true),
});

export type CollarFormValues = z.infer<typeof collarSchema>;

export const geofenceSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(80, 'Máximo 80 caracteres'),

  centerLatitude: z.number({
    required_error: 'La latitud es obligatoria',
    invalid_type_error: 'Latitud inválida',
  }),

  centerLongitude: z.number({
    required_error: 'La longitud es obligatoria',
    invalid_type_error: 'Longitud inválida',
  }),

  radiusMeters: z
    .number({
      required_error: 'El radio es obligatorio',
      invalid_type_error: 'Radio inválido',
    })
    .min(1, 'El radio debe ser mayor a 0'),

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
    .refine((value) => !/\s/.test(value), 'El correo no puede contener espacios'),

  role: z.enum(['ADMINISTRADOR', 'SUPERVISOR', 'OPERADOR', 'TECNICO'], {
    errorMap: () => ({ message: 'Debes seleccionar un rol' }),
  }),

  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(50, 'La contraseña no puede superar 50 caracteres')
    .refine((value) => !/\s/.test(value), 'La contraseña no puede contener espacios'),

  active: z.boolean().default(true),
});

export type UserCreateFormValues = z.infer<typeof userCreateSchema>;

// Alias por compatibilidad si otro archivo usa userSchema
export const userSchema = userCreateSchema;
export type UserFormValues = UserCreateFormValues;