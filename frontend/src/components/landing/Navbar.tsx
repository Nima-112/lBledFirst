import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Menu, X, LogIn, User as UserIcon, LogOut, CalendarCheck, GraduationCap, Star, ChevronDown } from "lucide-react";
import { Logo } from "./Logo";
import { LanguageSelector } from "./LanguageSelector";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/mock-auth";

export function Navbar({ onDiscover }: { onDiscover: () => void }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#regions", label: t("nav.regions") },
    { href: "#experiences", label: t("nav.experiences") },
    { href: "#how", label: t("nav.how") },
  ];

  const isTourist = user?.role === "tourist";

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-border/60 bg-background/85 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <a href="#top" className={scrolled ? "text-foreground" : "text-card"}>
          <Logo />
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`story-link text-sm font-medium transition-colors ${
                scrolled ? "text-foreground/80 hover:text-foreground" : "text-card/90 hover:text-card"
              }`}
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/formations"
            className={`story-link text-sm font-medium transition-colors ${
              scrolled ? "text-foreground/80 hover:text-foreground" : "text-card/90 hover:text-card"
            }`}
          >
            {t("nav.formations")}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSelector variant={scrolled ? "dark" : "light"} />

          {isTourist ? (
            <TouristMenu scrolled={scrolled} />
          ) : (
            <Link
              to="/auth"
              className={`hidden items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors sm:inline-flex ${
                scrolled
                  ? "border-border text-foreground hover:bg-muted"
                  : "border-card/40 text-card hover:bg-card/15"
              }`}
            >
              <LogIn className="h-4 w-4" />
              {t("nav.login")}
            </Link>
          )}

          <button
            onClick={onDiscover}
            className="hidden rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-warm transition-transform hover:scale-105 sm:inline-flex"
          >
            {t("nav.cta")}
          </button>
          <button
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full lg:hidden ${
              scrolled ? "text-foreground" : "text-card"
            }`}
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-border bg-background/95 backdrop-blur-xl lg:hidden"
        >
          <div className="flex flex-col gap-1 px-4 py-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-foreground hover:bg-muted"
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/formations"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-medium text-foreground hover:bg-muted"
            >
              {t("nav.formations")}
            </Link>

            {isTourist ? (
              <MobileTouristLinks onClose={() => setOpen(false)} />
            ) : (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted"
              >
                <LogIn className="h-4 w-4" />
                {t("nav.login")}
              </Link>
            )}

            <button
              onClick={() => {
                setOpen(false);
                onDiscover();
              }}
              className="mt-1 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              {t("nav.cta")}
            </button>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}

function TouristMenu({ scrolled }: { scrolled: boolean }) {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-tourist-menu]")) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (!user) return null;
  const initial = user.fullName.charAt(0).toUpperCase();

  return (
    <div data-tourist-menu className="relative hidden sm:block">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 rounded-full border px-2 py-1.5 pe-3 text-sm font-semibold transition-colors ${
          scrolled ? "border-border text-foreground hover:bg-muted" : "border-card/40 text-card hover:bg-card/15"
        }`}
      >
        {user.avatar ? (
          <img src={user.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {initial}
          </span>
        )}
        <span className="max-w-[120px] truncate">{user.fullName.split(" ")[0]}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute end-0 mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          <div className="border-b border-border bg-muted/40 px-4 py-3">
            <p className="truncate text-sm font-semibold text-foreground">{user.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="py-1">
            <MenuLink to="/me/bookings" icon={<CalendarCheck className="h-4 w-4" />} label={t("nav.me.bookings")} onClick={() => setOpen(false)} />
            <MenuLink to="/me/formations" icon={<GraduationCap className="h-4 w-4" />} label={t("nav.me.formations")} onClick={() => setOpen(false)} />
            <MenuLink to="/me/reviews" icon={<Star className="h-4 w-4" />} label={t("nav.me.reviews")} onClick={() => setOpen(false)} />
            <MenuLink to="/me/profile" icon={<UserIcon className="h-4 w-4" />} label={t("nav.me.profile")} onClick={() => setOpen(false)} />
          </div>
          <button
            onClick={() => { logout(); setOpen(false); navigate({ to: "/" }); }}
            className="flex w-full items-center gap-2 border-t border-border px-4 py-3 text-start text-sm font-medium text-destructive transition hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            {t("nav.me.logout")}
          </button>
        </div>
      )}
    </div>
  );
}

function MenuLink({ to, icon, label, onClick }: { to: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
    >
      {icon}
      {label}
    </Link>
  );
}

function MobileTouristLinks({ onClose }: { onClose: () => void }) {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  if (!user) return null;
  const item = (to: string, label: string, icon: React.ReactNode) => (
    <Link
      to={to}
      onClick={onClose}
      className="flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-medium text-foreground hover:bg-muted"
    >
      {icon}
      {label}
    </Link>
  );
  return (
    <>
      <div className="mt-1 border-t border-border pt-2 text-xs font-semibold uppercase text-muted-foreground px-3">
        {user.fullName}
      </div>
      {item("/me/bookings", t("nav.me.bookings"), <CalendarCheck className="h-4 w-4" />)}
      {item("/me/formations", t("nav.me.formations"), <GraduationCap className="h-4 w-4" />)}
      {item("/me/reviews", t("nav.me.reviews"), <Star className="h-4 w-4" />)}
      {item("/me/profile", t("nav.me.profile"), <UserIcon className="h-4 w-4" />)}
      <button
        onClick={() => { logout(); onClose(); navigate({ to: "/" }); }}
        className="flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-medium text-destructive hover:bg-destructive/10"
      >
        <LogOut className="h-4 w-4" />
        {t("nav.me.logout")}
      </button>
    </>
  );
}
