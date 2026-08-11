import { useState } from "react";
import { authService } from "@/services/auth.service";
import type { SignupData } from "@/types/auth";

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ne connecte plus automatiquement : le compte est créé mais reste inactif
  // tant que l'email n'est pas confirmé. Le backend ne pose plus de cookie ici
  // (cf. AuthController.register()) — appeler setAuth() sur cette réponse créerait
  // un état "connecté" côté React sans session réelle derrière (perdu au refresh).
  const signup = async (
    data: SignupData,
  ): Promise<{
    ok: boolean;
    error?: string;
    role?: "admin" | "tourist";
    emailVerified?: boolean;
  }> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.signup(data);
      return { ok: true, role: response.role, emailVerified: response.emailVerified };
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
