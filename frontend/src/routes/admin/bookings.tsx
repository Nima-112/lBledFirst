import { createFileRoute } from "@tanstack/react-router";
import { BookingsPanel } from "@/components/admin/BookingsPanel";

export const Route = createFileRoute("/admin/bookings")({
  component: BookingsPage,
});

function BookingsPage() {
  return <BookingsPanel />;
}
