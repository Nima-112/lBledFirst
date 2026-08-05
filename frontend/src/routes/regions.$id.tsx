import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowLeft, Clock, MapPin, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ImageCarousel } from "@/components/experiences/ImageCarousel";
import { useI18n } from "@/lib/i18n";
import { getRegionById, type FrontRegion } from "@/services/regions.service";
import { getExperiencesByRegion, type FrontExperience } from "@/services/experiences.service";

export const Route = createFileRoute("/regions/$id")({
  head: () => ({
    meta: [{ title: "Région — L'Bled First" }],
  }),
  component: RegionDetailRoute,
});

function RegionDetailRoute() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const navigate = useNavigate();

  const [region, setRegion] = useState<FrontRegion | null>(null);
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
        const [foundRegion, foundExperiences] = await Promise.all([
          getRegionById(id),
          getExperiencesByRegion(id),
        ]);
        if (cancelled) return;
        setRegion(foundRegion);
        setExperiences(foundExperiences);
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Erreur de chargement";
        setError(msg);
        setRegion(null);
        setExperiences([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const openExperience = (expId: string) => {
    navigate({ to: "/experiences/$id", params: { id: expId } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onDiscover={() => {}} />
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !region) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onDiscover={() => {}} />
        <div className="flex min-h-[70vh] items-center justify-center px-4 text-center">
          <div className="max-w-md">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {t("regions.detail.notFound")}
            </h1>
            {error && <p className="mt-2 text-sm text-muted-foreground">{error}</p>}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setReloadKey((k) => k + 1)}
                className="inline-flex items-center gap-2 rounded-full border border-primary px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
              >
                <RefreshCw className="h-4 w-4" /> Réessayer
              </button>
              <Link
                to="/regions"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90"
              >
                <ArrowLeft className="h-4 w-4" /> {t("regions.detail.back")}
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-grain min-h-screen bg-background">
      <Navbar onDiscover={() => {}} />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="absolute inset-0 -z-10">
          <img src={region.image} alt={region.name[lang]} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Link
            to="/regions"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-foreground/80 transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> {t("regions.detail.back")}
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {region.jiha[lang]}
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] text-foreground sm:text-6xl">
              {region.name[lang]}
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{region.activity[lang]}</p>
          </motion.div>
        </div>
      </section>

      {/* Experiences grid */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="mb-8 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{experiences.length}</span>{" "}
            {t("map.experiences")}
          </p>

          {experiences.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center">
              <p className="font-display text-xl font-bold">{t("regions.detail.empty")}</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {experiences.map((e, i) => (
                <ExperienceCard key={e.id} exp={e} index={i} onOpen={openExperience} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ExperienceCard({
  exp,
  index,
  onOpen,
}: {
  exp: FrontExperience;
  index: number;
  onOpen: (id: string) => void;
}) {
  const { t } = useI18n();
  const expId = String(exp.id);
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.05 }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-warm"
    >
      <div className="relative">
        <ImageCarousel
          images={exp.images}
          alt={exp.title}
          rounded="rounded-none"
          className="h-60 w-full"
          autoplayMs={0}
        />
        <span className="absolute end-3 top-3 rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground shadow-warm">
          {exp.price} MAD
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-4 text-sm font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-primary" /> {exp.region}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" /> {exp.durationDays}
            {t("acts.dayShort")}
          </span>
        </div>

        <h3 className="mt-4 font-display text-3xl font-bold leading-tight text-foreground">
          {exp.title}
        </h3>

        <p className="mt-4 line-clamp-3 flex-1 text-base leading-relaxed text-muted-foreground">
          {exp.description}
        </p>

        <button
          type="button"
          onClick={() => onOpen(expId)}
          className="mt-6 inline-flex w-fit items-center justify-center gap-2 rounded-full border-2 border-primary px-8 py-3 text-sm font-bold uppercase tracking-wide text-primary transition-all hover:bg-primary hover:text-primary-foreground"
        >
          {t("acts.viewProgram")}
          <span className="transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">
            →
          </span>
        </button>
      </div>
    </motion.article>
  );
}
