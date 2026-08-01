import { createFileRoute } from "@tanstack/react-router";
import { BookingsPanel } from "@/components/admin/BookingsPanel";
import { useAdminData } from "@/context/AdminDataContext";

export const Route = createFileRoute("/admin/bookings")({
  component: BookingsPage,
});

function BookingsPage() {
  const { bookings, updBookings } = useAdminData();
  return <BookingsPanel bookings={bookings} onChange={updBookings} />;
}
