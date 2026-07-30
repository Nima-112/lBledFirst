import { useEffect, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { CalendarCheck, GraduationCap, Star, User as UserIcon, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/landing/Logo";
import { LanguageSelector } from "@/components/landing/LanguageSelector";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/mock-auth";

export function MeShell({ children, title }: { children: ReactNode; title: string }) {
  const { user, ready } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (ready && (!user || user.role !== "tourist")) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("lbf.auth.redirect", pathname);
      }
      navigate({ to: "/auth" });
    }
  }, [ready, user, navigate, pathname]);

  if (!ready || !user || user.role !== "tourist") {
    return <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">…</div>;
  }

  const tabs = [
    { to: "/me/bookings", label: t("nav.me.bookings"), icon: <CalendarCheck className="h-4 w-4" /> },
    { to: "/me/formations", label: t("nav.me.formations"), icon: <GraduationCap className="h-4 w-4" /> },
    { to: "/me/reviews", label: t("nav.me.reviews"), icon: <Star className="h-4 w-4" /> },
    { to: "/me/profile", label: t("nav.me.profile"), icon: <UserIcon className="h-4 w-4" /> },
  ] as const;

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <Link to="/" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("me.backHome")}</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <h1 className="mb-2 font-display text-2xl font-bold text-foreground">{title}</h1>
        <p className="mb-6 text-sm text-muted-foreground">{t("me.greeting")}, {user.fullName.split(" ")[0]}.</p>

        <nav className="mb-6 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const active = pathname === tab.to;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-primary text-primary-foreground shadow-warm"
                    : "border border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                {tab.icon}
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {children}
      </div>
    </div>
  );
}
