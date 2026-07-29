import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";
import type { SignupData } from "@/types/auth";

export function useSignup() {
  const { setAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signup = async (data: SignupData): Promise<{ ok: boolean; error?: string }> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.signup(data);
      setAuth(response);
      return { ok: true };
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erreur d'inscription";
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error };
}