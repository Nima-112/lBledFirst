import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, Film, MapPin } from "lucide-react";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useI18n } from "@/lib/i18n";
import { getRegionsList, type FrontRegion } from "@/services/regions.service";

export const Route = createFileRoute("/regions")({
  head: () => ({
    meta: [
      { title: "Régions — L'Bled First" },
      {
        name: "description",
        content:
          "Découvrez les régions rurales du Maroc et leurs expériences authentiques filmées avec des hôtes locaux.",
      },
    ],
  }),
  component: RegionsPage,
});

function RegionsPage() {
  const { t, lang } = useI18n();
  const [regions, setRegions] = useState<FrontRegion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await getRegionsList();
        if (cancelled) return;
        // Only show regions that have at least one published experience
        setRegions(all.filter((r) => r.experienceCount > 0));
      } catch {
        if (!cancelled) setRegions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-grain min-h-screen bg-background">
      <Navbar onDiscover={() => {}} />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-background" />
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-saffron/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <span className="font-hand text-base normal-case text-primary">
                {t("regions.kicker")}
              </span>
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] text-foreground sm:text-6xl">
              {t("regions.page.title")}
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              {t("regions.page.sub")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section className="pb-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card animate-pulse"
                >
                  <div className="h-56 w-full bg-muted" />
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <div className="h-4 w-1/3 rounded bg-muted" />
                    <div className="h-6 w-2/3 rounded bg-muted" />
                    <div className="h-4 w-full rounded bg-muted" />
                    <div className="h-10 w-1/2 rounded-full bg-muted mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : regions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center">
              <p className="font-display text-xl font-bold">{t("regions.page.empty")}</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {regions.map((r, i) => (
                <RegionCard key={r.id} region={r} index={i} lang={lang} t={t} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function RegionCard({
  region,
  index,
  lang,
  t,
}: {
  region: FrontRegion;
  index: number;
  lang: "fr" | "en" | "ar" | "es";
  t: (key: string) => string;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.05 }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-warm"
    >
      <div className="relative">
        <img
          src={region.image}
          alt={region.name[lang]}
          loading="lazy"
          className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/5 to-transparent" />
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1 text-xs font-bold text-foreground backdrop-blur">
          <Film className="h-3.5 w-3.5 text-primary" />
          {region.experienceCount} {t("map.experiences")}
        </span>
        <div className="absolute bottom-3 left-4 right-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground backdrop-blur">
            <MapPin className="h-3 w-3" />
            {region.jiha[lang]}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-2xl font-bold leading-tight text-foreground">
          {region.name[lang]}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {region.activity[lang]}
        </p>

        <Link
          to="/regions/$id"
          params={{ id: region.id }}
          className="mt-6 inline-flex w-fit items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-all hover:scale-105"
        >
          {t("regions.cta")}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
        </Link>
      </div>
    </motion.article>
  );
}
