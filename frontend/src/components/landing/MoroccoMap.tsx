import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowRight, Film, Compass } from "lucide-react";

import { Reveal, SectionHeading } from "./Reveal";
import { regions } from "./regions";
import { MOROCCO_PATH } from "./morocco-path";
import { useI18n } from "@/lib/i18n";

export function MoroccoMap({ onSelectRegion }: { onSelectRegion: () => void }) {
  const { t, lang } = useI18n();
  const [active, setActive] = useState<string>("imlil");
  const region = regions.find((r) => r.id === active) ?? regions[0];

  return (
    <section id="map" className="relative overflow-hidden bg-secondary/5 py-20 sm:py-28">
      {/* soft decorative glows */}
      <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading kicker={t("map.kicker")} title={t("map.title")} sub={t("map.sub")} />

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1.25fr_1fr]">
          {/* Map */}
          <Reveal>
            <div className="relative mx-auto aspect-square w-full max-w-2xl rounded-[2rem] border border-border/60 bg-card/40 p-4 shadow-card backdrop-blur-sm sm:p-8">
              <svg viewBox="0 0 1000 1000" className="h-full w-full overflow-visible">
                <defs>
                  <linearGradient id="land" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--clay)" stopOpacity="0.16" />
                    <stop offset="55%" stopColor="var(--saffron)" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.2" />
                  </linearGradient>
                  <filter id="landShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="8" stdDeviation="14" floodColor="var(--clay)" floodOpacity="0.18" />
                  </filter>
                </defs>

                <path
                  d={MOROCCO_PATH}
                  fill="url(#land)"
                  stroke="var(--clay)"
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                  filter="url(#landShadow)"
                />
                <path
                  d={MOROCCO_PATH}
                  fill="none"
                  stroke="var(--clay)"
                  strokeWidth="1"
                  strokeDasharray="3 5"
                  className="opacity-40"
                />

                {/* Region markers (coords are % of viewBox) */}
                {regions.map((r) => {
                  const isActive = active === r.id;
                  const cx = (r.x / 100) * 1000;
                  const cy = (r.y / 100) * 1000;
                  return (
                    <g
                      key={r.id}
                      transform={`translate(${cx} ${cy})`}
                      onMouseEnter={() => setActive(r.id)}
                      onClick={() => {
                        setActive(r.id);
                        onSelectRegion();
                      }}
                      className="cursor-pointer"
                      role="button"
                      aria-label={r.name[lang]}
                    >
                      {isActive && (
                        <motion.circle
                          r={28}
                          fill="var(--primary)"
                          opacity={0.18}
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: [0.8, 1.25, 0.8], opacity: [0.25, 0.05, 0.25] }}
                          transition={{ duration: 2.4, repeat: Infinity }}
                        />
                      )}
                      <circle r={isActive ? 16 : 8} fill="var(--primary)" className="transition-all duration-300" />
                      <circle r={isActive ? 6 : 3.5} fill="var(--card)" className="transition-all duration-300" />
                    </g>
                  );
                })}
              </svg>

              {/* floating label over the active marker only (keeps a dense map readable) */}
              {regions.map((r) => (
                <span
                  key={r.id}
                  style={{ left: `${r.x}%`, top: `${r.y}%` }}
                  className={`pointer-events-none absolute z-10 -translate-x-1/2 translate-y-4 whitespace-nowrap rounded-full bg-foreground px-2.5 py-1 text-[11px] font-bold text-background shadow-md transition-opacity duration-300 ${
                    active === r.id ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {r.name[lang]}
                </span>
              ))}
            </div>
          </Reveal>

          {/* Preview card */}
          <Reveal delay={0.1}>
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-card">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={region.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className="relative">
                      <img
                        src={region.image}
                        alt={region.name[lang]}
                        loading="lazy"
                        className="h-56 w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                      <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1 text-xs font-bold text-foreground backdrop-blur">
                        <Film className="h-3.5 w-3.5 text-primary" />
                        {region.experiences} {t("map.experiences")}
                      </span>
                      <div className="absolute bottom-3 left-4 right-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground backdrop-blur">
                          <MapPin className="h-3 w-3" />
                          {region.jiha[lang]}
                        </span>
                        <h3 className="mt-1 text-2xl font-bold text-card">
                          {region.name[lang]}
                        </h3>
                      </div>
                    </div>
                    <div className="p-5">
                      <span className="font-hand text-xl text-primary">{t("map.preview")}</span>
                      <p className="mt-1 flex items-start gap-2 text-muted-foreground">
                        <Compass className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                        {region.activity[lang]}
                      </p>
                      <button
                        onClick={onSelectRegion}
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
                      >
                        {t("regions.cta")}
                        <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* region chips */}
              <div className="flex flex-wrap gap-2">
                {regions.map((r) => (
                  <button
                    key={r.id}
                    onMouseEnter={() => setActive(r.id)}
                    onFocus={() => setActive(r.id)}
                    onClick={() => setActive(r.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      active === r.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground/70 hover:border-primary/40"
                    }`}
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    {r.name[lang]}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
