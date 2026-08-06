import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Clock, Star, Users, BookOpen, AlertTriangle, RefreshCw } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getFormationsList, type Formation } from "@/services/formations.service";
import { formatDuration } from "@/lib/formations";

const MAX_DISPLAY = 3;

export function Training() {
  const { t } = useI18n();
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const all = await getFormationsList();
        if (cancelled) return;
        // Sort by createdAt desc to show the 3 most recently published
        const sorted = [...all].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setFormations(sorted.slice(0, MAX_DISPLAY));
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Erreur de chargement";
        setError(msg);
        setFormations([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <section id="training" className="bg-muted/30 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-primary">
          {t("training.kicker")}
        </p>
        <h2 className="mt-3 text-center font-display text-4xl font-normal leading-tight tracking-wide text-foreground sm:text-5xl md:text-6xl">
          {t("training.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          {t("training.sub")}
        </p>

        {loading ? (
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card animate-pulse"
              >
                <div className="h-56 w-full bg-muted" />
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div className="h-3 w-1/3 rounded bg-muted" />
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
              Impossible de charger les formations
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
              {formations.length === 0 && (
                <p className="col-span-full text-center text-sm text-muted-foreground">
                  {t("training.empty")}
                </p>
              )}
              {formations.map((f, i) => (
                <motion.article
                  key={f.slug}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-12%" }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-300 hover:shadow-card"
                >
                  <div className="relative h-56 w-full overflow-hidden">
                    <img
                      src={f.coverImage}
                      alt={f.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute start-3 top-3 rounded-full bg-secondary/95 px-2.5 py-1 text-xs font-bold text-secondary-foreground shadow-warm">
                      {f.category}
                    </span>
                    {f.price === 0 ? (
                      <span className="absolute end-3 top-3 rounded-full bg-primary/95 px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-warm">
                        {t("training.free")}
                      </span>
                    ) : (
                      <span className="absolute end-3 top-3 rounded-full bg-primary/95 px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-warm">
                        {f.price} MAD
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5 text-primary" /> {f.level}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-primary" /> {formatDuration(f.totalDuration)}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl font-semibold tracking-wide text-foreground">
                      {f.title}
                    </h3>
                    <p className="flex-1 text-sm font-light leading-relaxed text-muted-foreground line-clamp-3">
                      {f.shortDescription}
                    </p>

                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      {f.studentsCount > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-primary" />
                          {f.studentsCount}
                        </span>
                      )}
                      {f.averageRating > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {f.averageRating.toFixed(1)}
                        </span>
                      )}
                    </div>

                    <Link
                      to="/formations/$slug"
                      params={{ slug: f.slug }}
                      className="group/btn mt-1 inline-flex w-fit items-center gap-1 rounded-full border border-primary px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      {t("training.viewDetail")}
                      <span className="transition-transform group-hover/btn:translate-x-1 rtl:rotate-180 rtl:group-hover/btn:-translate-x-1">
                        →
                      </span>
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* CTA to see all formations */}
            <div className="mt-12 text-center">
              <Link
                to="/formations"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-warm transition-all hover:scale-105 hover:shadow-lg"
              >
                {t("training.viewAll")}
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
