export type UserRole =
  | "ADMINISTRADOR"
  | "SUPERVISOR"
  | "OPERADOR"
  | "TECNICO";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UserFormValues {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}