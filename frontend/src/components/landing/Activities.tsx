import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Clock, MapPin, AlertTriangle, RefreshCw } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getExperiencesList, type FrontExperience } from "@/services/experiences.service";
import { ImageCarousel } from "@/components/experiences/ImageCarousel";

const MAX_DISPLAY = 3;

export function Activities() {
  const { t } = useI18n();
  const [experiences, setExperiences] = useState<FrontExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const all = await getExperiencesList();
        if (cancelled) return;
        const published = all.filter(
          (e) => (e.status as string) === "published" || !e.status || e.status === undefined,
        );
        // Show the 3 most recently published experiences
        published.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setExperiences(published.slice(0, MAX_DISPLAY));
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Erreur de chargement";
        setError(msg);
        setExperiences([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <section id="experiences" className="bg-background py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-primary">
          {t("acts.kicker")}
        </p>
        <h2 className="mt-3 text-center font-display text-4xl font-normal leading-tight tracking-wide text-foreground sm:text-5xl md:text-6xl">
          {t("acts.title")}
        </h2>

        {loading ? (
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card animate-pulse"
              >
                <div className="h-56 w-full bg-muted" />
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div className="h-3 w-2/3 rounded bg-muted" />
                  <div className="h-6 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-5/6 rounded bg-muted" />
                  <div className="h-9 w-1/2 rounded-full bg-muted mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-16 rounded-2xl border border-destructive/40 bg-destructive/5 p-12 text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <p className="font-display text-lg font-bold text-destructive">
              Impossible de charger les expériences
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary px-5 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
            >
              <RefreshCw className="h-4 w-4" /> Réessayer
            </button>
          </div>
        ) : (
          <>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.length === 0 && (
              <p className="col-span-full text-center text-sm text-muted-foreground">
                {t("acts.empty")}
              </p>
            )}
            {experiences.map((e, i) => (
              <motion.article
                key={e.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-12%" }}
                transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-300 hover:shadow-card"
              >
                <div className="relative">
                  <ImageCarousel
                    images={e.images}
                    alt={e.title}
                    rounded="rounded-none"
                    className="h-56 w-full"
                  />
                  <span className="absolute end-3 top-3 rounded-full bg-primary/95 px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-warm">
                    {e.price} MAD
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> {e.region}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-primary" /> {e.durationDays}
                      {t("acts.dayShort")}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-semibold tracking-wide text-foreground">
                    {e.title}
                  </h3>
                  <p className="flex-1 text-sm font-light leading-relaxed text-muted-foreground line-clamp-3">
                    {e.description}
                  </p>
                  <Link
                    to="/experiences/$id"
                    params={{ id: String(e.id) }}
                    className="group mt-1 inline-flex w-fit items-center gap-1 rounded-full border border-primary px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    {t("acts.viewProgram")}
                    <span className="transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        
          {/* CTA to see all experiences */}
          <div className="mt-12 text-center">
            <a
              href="/experiences"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-warm transition-all hover:scale-105 hover:shadow-lg"
            >
              {t("acts.viewAll")}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
          </>
        )}
      </div>
    </section>
  );
}
