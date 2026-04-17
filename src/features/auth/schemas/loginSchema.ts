import { z } from "zod";

const emailWithoutSpaces = /^\S+@\S+\.\S+$/;
const passwordWithoutSpaces = /^\S+$/;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es obligatorio.")
    .regex(emailWithoutSpaces, "El correo no puede contener espacios y debe ser válido."),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria.")
    .regex(passwordWithoutSpaces, "La contraseña no puede contener espacios."),
});

export type LoginSchemaValues = z.infer<typeof loginSchema>;