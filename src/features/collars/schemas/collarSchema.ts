import { z } from "zod";

export const collarSchema = z.object({
  token: z
    .string()
    .trim()
    .min(3, "El token es obligatorio.")
    .max(100, "El token no puede superar los 100 caracteres."),
  status: z
    .string()
    .trim()
    .min(1, "El estado es obligatorio.")
    .max(50, "El estado no puede superar los 50 caracteres."),
  batteryLevel: z
    .number({
      invalid_type_error: "La batería debe ser numérica.",
    })
    .min(0, "La batería mínima es 0.")
    .max(100, "La batería máxima es 100.")
    .optional(),
  signalStrength: z
    .number({
      invalid_type_error: "La señal debe ser numérica.",
    })
    .min(0, "La señal mínima es 0.")
    .max(100, "La señal máxima es 100.")
    .optional(),
  firmwareVersion: z
    .string()
    .trim()
    .max(50, "La versión no puede superar los 50 caracteres.")
    .optional(),
  cowId: z.number().int().positive().optional().nullable(),
});

export type CollarSchemaValues = z.infer<typeof collarSchema>;