import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Clock, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getExperiences, type MockExperience } from "@/lib/mock-auth";
import { ImageCarousel } from "@/components/experiences/ImageCarousel";

export function Activities() {
  const { t } = useI18n();
  const [experiences, setExperiences] = useState<MockExperience[]>([]);

  useEffect(() => {
    setExperiences(getExperiences().filter((e) => e.status === "published"));
  }, []);

  return (
    <section id="experiences" className="bg-background py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-primary">
          {t("acts.kicker")}
        </p>
        <h2 className="mt-3 text-center font-display text-4xl font-normal leading-tight tracking-wide text-foreground sm:text-5xl md:text-6xl">
          {t("acts.title")}
        </h2>

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
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-primary" /> {e.region}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-primary" /> {e.durationDays}{t("acts.dayShort")}</span>
                </div>
                <h3 className="font-display text-2xl font-semibold tracking-wide text-foreground">
                  {e.title}
                </h3>
                <p className="flex-1 text-sm font-light leading-relaxed text-muted-foreground line-clamp-3">
                  {e.description}
                </p>
                <Link
                  to="/experiences/$id"
                  params={{ id: e.id }}
                  className="group mt-1 inline-flex w-fit items-center gap-1 rounded-full border border-primary px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {t("acts.viewProgram")}
                  <span className="transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">→</span>
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
