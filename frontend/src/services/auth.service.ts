import { api } from "@/lib/api";
import type { AuthResponse, LoginCredentials, SignupData } from "@/types/auth";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/login", credentials);
    return data;
  },

  async signup(data: SignupData): Promise<AuthResponse> {
    const { data: response } = await api.post<AuthResponse>("/auth/register", data);
    return response;
  },

  async me(): Promise<AuthResponse> {
    const { data } = await api.get<AuthResponse>("/auth/me");
    return data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post("/auth/forgot-password", { email });
  },

  async resetPassword(payload: { token: string; newPassword: string; confirmNewPassword: string }): Promise<void> {
    await api.post("/auth/reset-password", payload);
  },

  // Public (pas besoin d'être connecté) : utile juste après l'inscription ou
  // quand la connexion est refusée pour cause d'email non confirmé.
  async resendVerification(email: string): Promise<void> {
    await api.post("/auth/resend-verification", { email });
  },
};