import { createFileRoute } from "@tanstack/react-router";

import { useAdminData } from "@/context/AdminDataContext";
import { FormationsPanel } from "@/components/admin/FormationsPanel";

export const Route = createFileRoute("/admin/formations")({
  component: FormationsPage,
});

function FormationsPage() {
  const { formations, updFormations } = useAdminData();
  return <FormationsPanel formations={formations} onChange={updFormations} />;
}