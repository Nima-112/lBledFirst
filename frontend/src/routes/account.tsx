import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "Redirection espace personnel — L'Bled First" }] }),
  component: AccountRoute,
});

function AccountRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/me/bookings", replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">Redirection...</div>
  );
}
