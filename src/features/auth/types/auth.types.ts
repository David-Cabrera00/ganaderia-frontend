export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  active?: boolean;
}

export interface LoginResponseData {
  token: string;
  user: AuthUser;
}