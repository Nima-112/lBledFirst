import { createFileRoute, Outlet } from "@tanstack/react-router";
import { I18nProvider } from "@/lib/i18n";
import { AdminDataProvider } from "@/context/AdminDataContext";
import { AdminGuard } from "../components/admin/AdminGuard";
import { AdminShell } from "../components/admin/AdminShell";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <I18nProvider>
      <AdminGuard>
        <AdminDataProvider>
          <AdminShell />
        </AdminDataProvider>
      </AdminGuard>
    </I18nProvider>
  );
}
