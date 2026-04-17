import { z } from "zod";

export const alertSchema = z.object({
  message: z
    .string()
    .trim()
    .min(3, "El mensaje debe tener al menos 3 caracteres.")
    .max(255, "El mensaje no puede superar los 255 caracteres."),
  type: z
    .string()
    .trim()
    .min(1, "El tipo es obligatorio.")
    .max(50, "El tipo no puede superar los 50 caracteres."),
  status: z.enum(["PENDIENTE", "RESUELTA", "CANCELADA"], {
    errorMap: () => ({ message: "Selecciona un estado válido." }),
  }),
  cowId: z.number().int().positive().optional().nullable(),
  collarId: z.number().int().positive().optional().nullable(),
});

export type AlertSchemaValues = z.infer<typeof alertSchema>;