import { createFileRoute } from "@tanstack/react-router";
import { ExperiencesPanel } from "@/components/admin/ExperiencesPanel";

export const Route = createFileRoute("/admin/experiences")({
  component: ExperiencesPage,
});

function ExperiencesPage() {
  return <ExperiencesPanel />;
}
