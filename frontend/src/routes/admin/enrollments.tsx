import { createFileRoute } from "@tanstack/react-router";
import { FormationEnrollmentsPanel } from "@/components/admin/FormationEnrollmentsPanel";

export const Route = createFileRoute("/admin/enrollments")({
  component: () => <FormationEnrollmentsPanel />,
});
