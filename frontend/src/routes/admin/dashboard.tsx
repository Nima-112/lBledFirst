import { createFileRoute } from "@tanstack/react-router";

import { useAdminData } from "@/context/AdminDataContext";
import { DashboardPanel } from "@/components/admin/DashboardPanel";

export const Route = createFileRoute("/admin/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { users, experiences, bookings, reviews, formations } = useAdminData();
  return (
    <DashboardPanel
      users={users}
      experiences={experiences}
      bookings={bookings}
      reviews={reviews}
      formations={formations}
    />
  );
}
