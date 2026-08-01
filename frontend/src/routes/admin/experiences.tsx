import { createFileRoute } from "@tanstack/react-router";
import { ExperiencesPanel } from "@/components/admin/ExperiencesPanel";
import { useAdminData } from "@/context/AdminDataContext";

export const Route = createFileRoute("/admin/experiences")({
  component: ExperiencesPage,
});

function ExperiencesPage() {
  const { experiences, users, updExperiences } = useAdminData();
  return (
    <ExperiencesPanel
      experiences={experiences}
      users={users}
      onChange={updExperiences}
    />
  );
}