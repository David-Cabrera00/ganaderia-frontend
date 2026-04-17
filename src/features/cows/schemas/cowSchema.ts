import { z } from "zod";

export const cowSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(100, "El nombre no puede superar los 100 caracteres."),
  token: z
    .string()
    .trim()
    .min(3, "El token es obligatorio.")
    .max(100, "El token no puede superar los 100 caracteres."),
  internalCode: z
    .string()
    .trim()
    .min(2, "El código interno es obligatorio.")
    .max(50, "El código interno no puede superar los 50 caracteres."),
  latitude: z
    .number({
      invalid_type_error: "La latitud debe ser numérica.",
    })
    .min(-90, "La latitud mínima es -90.")
    .max(90, "La latitud máxima es 90.")
    .optional(),
  longitude: z
    .number({
      invalid_type_error: "La longitud debe ser numérica.",
    })
    .min(-180, "La longitud mínima es -180.")
    .max(180, "La longitud máxima es 180.")
    .optional(),
  status: z.enum(["DENTRO", "FUERA", "INACTIVA"], {
    errorMap: () => ({ message: "Selecciona un estado válido." }),
  }),
  collarId: z.number().int().positive().optional().nullable(),
  geofenceId: z.number().int().positive().optional().nullable(),
});

export type CowSchemaValues = z.infer<typeof cowSchema>;