import { createFileRoute } from "@tanstack/react-router";

import { FormationsPanel } from "@/components/admin/FormationsPanel";

export const Route = createFileRoute("/admin/formations")({
  component: FormationsPage,
});

function FormationsPage() {
  return <FormationsPanel />;
}
