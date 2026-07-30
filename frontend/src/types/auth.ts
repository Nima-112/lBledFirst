export type Role = "admin" | "tourist";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  country?: string;
  language?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  language: string;
}

// Le token JWT ne quitte jamais le cookie httpOnly : le corps de la réponse
// ne contient que les infos utilisateur non sensibles.
export interface AuthResponse {
  id: string;
  role: Role;
  name: string;
  email: string;
}
