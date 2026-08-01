import { createFileRoute } from "@tanstack/react-router";
import { TouristsPanel } from "@/components/admin/TouristsPanel";
import { useAdminData } from "@/context/AdminDataContext";

export const Route = createFileRoute("/admin/tourists")({
  component: TouristsPage,
});

function TouristsPage() {
  const { users, updUsers } = useAdminData();
  return <TouristsPanel users={users} onChange={updUsers} />;
}