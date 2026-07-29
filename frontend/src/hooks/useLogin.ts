import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";
import type { LoginCredentials } from "@/types/auth";

export function useLogin() {
  const { setAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials): Promise<{ ok: boolean; error?: string }> => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(credentials);
      setAuth(data);
      return { ok: true };
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erreur de connexion";
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}