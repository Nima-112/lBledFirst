import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && (!user || user.role !== "admin")) {
      navigate({ to: "/auth" });
    }
  }, [ready, user, navigate]);

  if (!ready || !user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        …
      </div>
    );
  }

  return <>{children}</>;
}