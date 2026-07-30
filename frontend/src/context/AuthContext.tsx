import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { ReactNode } from "react";

import type { AuthResponse, User } from "@/types/auth";
import { authService } from "@/services/auth.service";

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  setAuth: (auth: AuthResponse) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toUser(auth: AuthResponse): User {
  return { id: auth.id, email: auth.email, name: auth.name, role: auth.role };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  // Le JWT vit uniquement dans un cookie httpOnly (inaccessible en JS) : on
  // hydrate la session en interrogeant /auth/me, qui l'envoie automatiquement.
  useEffect(() => {
    authService
      .me()
      .then((data) => setUser(toUser(data)))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  const setAuth = useCallback((auth: AuthResponse) => {
    setUser(toUser(auth));
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      window.location.href = "/auth";
    }
  }, []);

  const value = useMemo(
    () => ({ user, ready, setAuth, logout }),
    [user, ready, setAuth, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}