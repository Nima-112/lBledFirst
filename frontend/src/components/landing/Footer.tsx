import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Send, Instagram, Youtube, Facebook } from "lucide-react";
import { Logo } from "./Logo";
import { LANGUAGES, useI18n, type Lang } from "@/lib/i18n";

export function Footer() {
  const { t, lang, setLang } = useI18n();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setDone(true);
    setEmail("");
  };

  return (
    <footer className="bg-ink text-card">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1.6fr]">
          {/* Brand */}
          <div>
            <span className="text-card">
              <Logo />
            </span>
            <p className="mt-4 max-w-xs text-card/70">{t("foot.tagline")}</p>
            <div className="mt-5 flex gap-3">
              {[Instagram, Youtube, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-10 w-10 place-items-center rounded-full bg-card/10 text-card transition-colors hover:bg-primary"
                  aria-label="social link"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-card/60">
              {t("foot.explore")}
            </h4>
            <ul className="mt-4 space-y-2.5 text-card/80">
              <li><Link to="/regions" className="hover:text-saffron">{t("nav.regions")}</Link></li>
              <li><a href="#experiences" className="hover:text-saffron">{t("nav.experiences")}</a></li>
              <li><a href="#how" className="hover:text-saffron">{t("nav.how")}</a></li>
              <li><a href="#host" className="hover:text-saffron">{t("nav.host")}</a></li>
            </ul>
          </div>

          {/* Newsletter + language */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-card/60">
              {t("foot.newsletter")}
            </h4>
            <form onSubmit={onSubmit} className="mt-4 flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("foot.email")}
                className="w-full rounded-full border border-card/20 bg-card/10 px-4 py-3 text-sm text-card placeholder:text-card/50 focus:border-saffron focus:outline-none"
              />
              <button
                type="submit"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
                aria-label={t("foot.subscribe")}
              >
                <Send className="h-5 w-5 rtl:rotate-180" />
              </button>
            </form>
            {done && <p className="mt-2 text-sm text-saffron">{t("foot.subscribed")}</p>}

            <h4 className="mt-8 text-sm font-bold uppercase tracking-wider text-card/60">
              {t("foot.language")}
            </h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code as Lang)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    lang === l.code
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-card/20 bg-card/5 text-card/80 hover:bg-card/10"
                  }`}
                >
                  <span>{l.flag}</span>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-card/10 pt-6 text-sm text-card/60 sm:flex-row">
          <p>© {new Date().getFullYear()} L'Bled First. {t("foot.rights")}</p>
          <p className="font-hand text-lg text-saffron">Made with تيريرا · raw beauty &amp; human connection</p>
        </div>
      </div>
    </footer>
  );
}
