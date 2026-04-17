import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, type UserSchemaValues } from "../schemas/userSchema";
import type { UserRole } from "../types/user.types";

interface UserFormProps {
  onSubmit: (values: UserSchemaValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

const roleOptions: UserRole[] = [
  "ADMINISTRADOR",
  "SUPERVISOR",
  "OPERADOR",
  "TECNICO",
];

const UserForm = ({ onSubmit, isSubmitting = false }: UserFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserSchemaValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "OPERADOR",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="name">Nombre</label>
        <input id="name" type="text" {...register("name")} />
        {errors.name && <p>{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email">Correo</label>
        <input id="email" type="email" {...register("email")} />
        {errors.email && <p>{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password">Contraseña</label>
        <input id="password" type="password" {...register("password")} />
        {errors.password && <p>{errors.password.message}</p>}
      </div>

      <div>
        <label htmlFor="role">Rol</label>
        <select id="role" {...register("role")}>
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        {errors.role && <p>{errors.role.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Crear usuario"}
      </button>
    </form>
  );
};

export default UserForm;