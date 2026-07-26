import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cdnAssetUrl } from "@/lib/asset-url";
import { useI18n } from "@/lib/i18n";
import img14 from "@/assets/rural/rural-14.jpg.asset.json";
import img11 from "@/assets/rural/rural-11.jpg.asset.json";
import midday from "@/assets/rural/up-16.jpg.asset.json";
import souk from "@/assets/rural/up-17.jpg.asset.json";
import sunset from "@/assets/rural/up-18.jpg.asset.json";
import night from "@/assets/rural/up-19.jpg.asset.json";

export function Timeline() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);

  const days = [
    { time: t("timeline.d1.time"), title: t("timeline.d1.title"), body: t("timeline.d1.body"), image: cdnAssetUrl(img14.url) },
    { time: t("timeline.d2.time"), title: t("timeline.d2.title"), body: t("timeline.d2.body"), image: cdnAssetUrl(img11.url) },
    { time: t("timeline.d3.time"), title: t("timeline.d3.title"), body: t("timeline.d3.body"), image: cdnAssetUrl(midday.url) },
    { time: t("timeline.d4.time"), title: t("timeline.d4.title"), body: t("timeline.d4.body"), image: cdnAssetUrl(souk.url) },
    { time: t("timeline.d5.time"), title: t("timeline.d5.title"), body: t("timeline.d5.body"), image: cdnAssetUrl(sunset.url) },
    { time: t("timeline.d6.time"), title: t("timeline.d6.title"), body: t("timeline.d6.body"), image: cdnAssetUrl(night.url) },
  ];

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 60%", "end 80%"],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-ink px-6 py-24 sm:px-10 sm:py-28"
    >
      <div className="mx-auto max-w-4xl">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-saffron">
          {t("timeline.kicker")}
        </p>
        <h2 className="mt-3 text-center font-display text-4xl font-light leading-tight tracking-wide text-card sm:text-5xl md:text-6xl">
          {t("timeline.title")}
        </h2>

        <div className="relative mt-20">
          {/* vertical line — desktop centered, mobile at start */}
          <motion.div
            style={{ scaleY, transformOrigin: "top" }}
            className="absolute bottom-0 top-0 w-px bg-saffron/40 left-3 md:left-1/2"
          />

          <div className="flex flex-col gap-16 sm:gap-20">
            {days.map((day, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-15%" }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex items-start gap-6 md:gap-10 ${
                    isLeft ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* text */}
                  <div
                    className={`flex-1 pl-10 md:pl-0 ${
                      isLeft ? "md:text-right" : "md:text-left"
                    }`}
                  >
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-saffron/80">
                      {day.time}
                    </span>
                    <h3 className="mt-2 font-display text-2xl font-medium leading-tight text-card sm:text-3xl md:text-4xl">
                      {day.title}
                    </h3>
                    <p className="mt-3 text-sm font-light leading-relaxed text-card/70 sm:text-base">
                      {day.body}
                    </p>
                  </div>

                  {/* node — only shown from md up (mobile uses the left rail) */}
                  <div className="hidden w-3 shrink-0 flex-col items-center pt-2 md:flex">
                    <div className="h-3 w-3 rounded-full border-2 border-saffron bg-ink" />
                  </div>

                  {/* image */}
                  <div className="flex-1 pl-10 md:pl-0">
                    <div className="h-40 w-full overflow-hidden rounded-lg sm:h-52 md:h-56">
                      <img
                        src={day.image}
                        alt={day.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
