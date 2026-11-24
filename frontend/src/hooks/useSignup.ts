import { useState } from "react";
import { authService } from "@/services/auth.service";
import { parseApiError } from "@/lib/api-errors";
import type { SignupData } from "@/types/auth";

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const parsed = parseApiError(err, "Registration failed. Please check your inputs.");
      let msg = parsed.message;

      const isKnownError =
        msg.includes("Email already in use") ||
        msg.includes("Passwords do not match") ||
        msg.includes("Password must be at least 8 characters") ||
        msg.includes("Password must contain uppercase, lowercase and digit") ||
        msg.includes("Email is required") ||
        msg.includes("Name is required") ||
        msg.includes("Password is required") ||
        msg.includes("Country is required") ||
        msg.includes("Language is required") ||
        msg.includes("Invalid email");

      if (!isKnownError) {
        msg = "Registration failed. Please check your inputs.";
      }

      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  };
  return { signup, loading, error };
}
