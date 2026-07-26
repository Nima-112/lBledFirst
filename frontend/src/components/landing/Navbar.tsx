import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Menu, X, LogIn } from "lucide-react";
import { Logo } from "./Logo";
import { LanguageSelector } from "./LanguageSelector";
import { useI18n } from "@/lib/i18n";

export function Navbar({ onDiscover }: { onDiscover: () => void }) {
  const { t } = useI18n();
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
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted"
            >
              <LogIn className="h-4 w-4" />
              {t("nav.login")}
            </Link>
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
