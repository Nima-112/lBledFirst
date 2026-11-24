import { createFileRoute } from "@tanstack/react-router";
import { DashboardPanel } from "@/components/admin/DashboardPanel";

export const Route = createFileRoute("/admin/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return <DashboardPanel />;
}
