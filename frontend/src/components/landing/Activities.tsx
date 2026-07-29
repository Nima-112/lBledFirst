import { motion } from "framer-motion";
import { cdnAssetUrl } from "@/lib/asset-url";
import { useI18n } from "@/lib/i18n";
import img15 from "@/assets/rural/rural-15.jpg.asset.json";
import artisan from "@/assets/rural/up-20.jpg.asset.json";
import tea from "@/assets/rural/up-21.jpg.asset.json";
import desert from "@/assets/rural/up-22.jpg.asset.json";
import cooking from "@/assets/rural/up-23.jpg.asset.json";
import valley from "@/assets/rural/up-24.jpg.asset.json";

export function Activities() {
  const { t } = useI18n();

  const activities = [
    { image: cdnAssetUrl(img15.url), title: t("acts.a1.title"), description: t("acts.a1.desc"), cta: t("acts.a1.cta") },
    { image: cdnAssetUrl(tea.url), title: t("acts.a2.title"), description: t("acts.a2.desc"), cta: t("acts.a2.cta") },
    { image: cdnAssetUrl(artisan.url), title: t("acts.a3.title"), description: t("acts.a3.desc"), cta: t("acts.a3.cta") },
    { image: cdnAssetUrl(desert.url), title: t("acts.a4.title"), description: t("acts.a4.desc"), cta: t("acts.a4.cta") },
    { image: cdnAssetUrl(cooking.url), title: t("acts.a5.title"), description: t("acts.a5.desc"), cta: t("acts.a5.cta") },
    { image: cdnAssetUrl(valley.url), title: t("acts.a6.title"), description: t("acts.a6.desc"), cta: t("acts.a6.cta") },
  ];

  return (
    <section className="bg-background py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-primary">
          {t("acts.kicker")}
        </p>
        <h2 className="mt-3 text-center font-display text-4xl font-normal leading-tight tracking-wide text-foreground sm:text-5xl md:text-6xl">
          {t("acts.title")}
        </h2>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((a, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-12%" }}
              transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-300 hover:shadow-card"
            >
              <div className="h-44 w-full overflow-hidden">
                <img
                  src={a.image}
                  alt={a.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-4 p-7">
                <h3 className="font-display text-2xl font-semibold tracking-wide text-foreground">
                  {a.title}
                </h3>
                <p className="flex-1 text-sm font-light leading-relaxed text-muted-foreground">
                  {a.description}
                </p>
                <button className="group inline-flex w-fit items-center gap-1 rounded-full border border-primary px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
                  {a.cta}
                  <span className="transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">
                    →
                  </span>
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
