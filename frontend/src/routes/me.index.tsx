import { createFileRoute, Navigate } from "@tanstack/react-router";
import { consumeAuthRedirect } from "@/lib/auth-redirect";

export const Route = createFileRoute("/me/")({
  component: MeIndexRedirect,
});

function MeIndexRedirect() {
  const pending = consumeAuthRedirect();
  if (pending) {
    window.location.assign(pending);
    return null;
  }
  return <Navigate to="/me/bookings" replace />;
}
