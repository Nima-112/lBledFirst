import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";
import { parseApiError } from "@/lib/api-errors";
import type { LoginCredentials } from "@/types/auth";

export function useLogin() {
  const { setAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (
    credentials: LoginCredentials,
  ): Promise<{ ok: boolean; error?: string; role?: "admin" | "tourist"; emailNotVerified?: boolean }> => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(credentials);
      setAuth(data);
      return { ok: true, role: data.role };
    } catch (err: any) {
      const parsed = parseApiError(err, "Login failed. Please try again.");
      let msg = parsed.message;
      const status = err?.response?.status;
      let emailNotVerified = false;

      const isEmailVerificationError =
        msg === "Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte de réception." ||
        msg.toLowerCase().includes("verify your email") ||
        msg.toLowerCase().includes("email not verified");

      if (isEmailVerificationError) {
        emailNotVerified = true;
        msg = "Please verify your email before logging in. Check your inbox.";
      } else if (
        status === 401 ||
        msg === "Identifiants invalides" ||
        msg === "Utilisateur introuvable" ||
        msg === "Invalid credentials" ||
        msg === "Unauthorized" ||
        msg === "Bad credentials"
      ) {
        msg = "Incorrect email or password. Please try again.";
      } else {
        msg = "Login failed. Please try again later.";
      }

      setError(msg);
      return { ok: false, error: msg, emailNotVerified };
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
