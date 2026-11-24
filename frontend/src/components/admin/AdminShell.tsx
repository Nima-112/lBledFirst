import { Link, useLocation } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import { useState } from "react";
import {
  CalendarCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Settings,
  ShieldCheck,
  Star,
  UserPlus,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/lib/i18n";
import { Logo } from "@/components/landing/Logo";
import { LanguageSelector } from "@/components/landing/LanguageSelector";

type TabId =
  | "dashboard"
  | "bookings"
  | "tourists"
  | "experiences"
  | "reviews"
  | "formations"
  | "enrollments"
  | "settings";

function useNav() {
  const { t } = useI18n();
  return [
    {
      id: "dashboard" as TabId,
      label: t("admin.nav.dashboard"),
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      id: "bookings" as TabId,
      label: t("admin.nav.bookings"),
      icon: <CalendarCheck className="h-4 w-4" />,
    },
    {
      id: "tourists" as TabId,
      label: t("admin.nav.tourists"),
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: "experiences" as TabId,
      label: t("admin.nav.experiences"),
      icon: <MapPin className="h-4 w-4" />,
    },
    { id: "reviews" as TabId, label: t("admin.nav.reviews"), icon: <Star className="h-4 w-4" /> },
    {
      id: "formations" as TabId,
      label: t("admin.nav.formations"),
      icon: <GraduationCap className="h-4 w-4" />,
    },
    {
      id: "enrollments" as TabId,
      label: t("admin.nav.enrollments"),
      icon: <UserPlus className="h-4 w-4" />,
    },
    {
      id: "settings" as TabId,
      label: t("admin.nav.settings"),
      icon: <Settings className="h-4 w-4" />,
    },
  ];
}

export function AdminShell() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const nav = useNav();
  const [mobileNav, setMobileNav] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNav((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border lg:hidden"
              aria-label="menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <Logo />
            <span className="hidden items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5" /> Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <span className="hidden text-sm text-muted-foreground md:inline">{user?.name}</span>
            <button
              onClick={() => logout()}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t("admin.logout")}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[230px_1fr]">
        <aside
          className={`${mobileNav ? "block" : "hidden"} lg:block lg:sticky lg:top-24 lg:self-start`}
        >
          <nav className="flex flex-col gap-1.5">
            {nav.map((item) => {
              const to = `/admin/${item.id}` as const;
              const isActive = pathname === to;
              return (
                <Link
                  key={item.id}
                  to={to}
                  onClick={() => setMobileNav(false)}
                  className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-warm"
                      : "bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
