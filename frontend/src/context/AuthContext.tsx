/**
 * Single source of truth for the logged-in user on the frontend.
 *
 * Auth model:
 * - Backend issues a JWT stored in an httpOnly cookie (`access_token`).
 * - Email/password and Google OAuth both end up with the same cookie.
 * - OAuth uses a short-lived servlet session only during the Google handshake;
 *   the backend destroys that session once the JWT cookie is set.
 * - Never read or store the token in JavaScript — use authService.me() instead.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthResponse, User } from "@/types/auth";
import { authService } from "@/services/auth.service";

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  setAuth: (auth: AuthResponse) => void;
  setUser: (u: Partial<User> & { id: string; email: string; name: string; role: User["role"] }) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toUser(auth: AuthResponse): User {
  return { 
    id: auth.id, 
    email: auth.email, 
    name: auth.name, 
    role: auth.role,
    phone: auth.phone,
    country: auth.country,
    language: auth.language,
    avatar: auth.avatar
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  // Le JWT vit uniquement dans un cookie httpOnly (inaccessible en JS) : on
  // hydrate la session en interrogeant /auth/me, qui l'envoie automatiquement.
  useEffect(() => {
    let mounted = true;
    authService
      .me()
      .then((u) => {
        if (!mounted) return;
        setUserState(u);
      })
      .catch(() => {
        if (!mounted) return;
        setUserState(null);
      })
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const setAuth = useCallback((auth: AuthResponse) => {
    setUserState(toUser(auth));
  }, []);

  const setUser = useCallback(
    (u: Partial<User> & { id: string; email: string; name: string; role: User["role"] }) => {
      setUserState({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        phone: u.phone,
        country: u.country,
        language: u.language,
        avatar: u.avatar,
      });
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUserState(null);
      window.location.href = "/auth";
    }
  }, []);

  const value = useMemo(
    () => ({ user, ready, setAuth, setUser, logout }),
    [user, ready, setAuth, setUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
