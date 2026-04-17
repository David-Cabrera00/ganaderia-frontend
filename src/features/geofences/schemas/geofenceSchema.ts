import { z } from "zod";

export const geofenceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(100, "El nombre no puede superar los 100 caracteres."),
  latitude: z
    .number({
      invalid_type_error: "La latitud debe ser numérica.",
    })
    .min(-90, "La latitud mínima es -90.")
    .max(90, "La latitud máxima es 90."),
  longitude: z
    .number({
      invalid_type_error: "La longitud debe ser numérica.",
    })
    .min(-180, "La longitud mínima es -180.")
    .max(180, "La longitud máxima es 180."),
  radiusMeters: z
    .number({
      invalid_type_error: "El radio debe ser numérico.",
    })
    .positive("El radio debe ser mayor que cero."),
  status: z.enum(["ACTIVA", "INACTIVA"], {
    errorMap: () => ({ message: "Selecciona un estado válido." }),
  }),
});

export type GeofenceSchemaValues = z.infer<typeof geofenceSchema>;