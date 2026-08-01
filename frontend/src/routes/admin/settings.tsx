import { createFileRoute } from "@tanstack/react-router";
import { SettingsPanel } from "@/components/admin/SettingsPanel";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return <SettingsPanel />;
}