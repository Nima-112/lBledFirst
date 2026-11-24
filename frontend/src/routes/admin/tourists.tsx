import { createFileRoute } from "@tanstack/react-router";
import { TouristsPanel } from "@/components/admin/TouristsPanel";

export const Route = createFileRoute("/admin/tourists")({
  component: TouristsPage,
});

function TouristsPage() {
  return <TouristsPanel />;
}
