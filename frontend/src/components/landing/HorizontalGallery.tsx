import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cdnAssetUrl } from "@/lib/asset-url";
import { useI18n } from "@/lib/i18n";
import a1 from "@/assets/rural/rural-15.jpg.asset.json";
import a2 from "@/assets/rural/rural-8.jpg.asset.json";
import a3 from "@/assets/rural/rural-12.jpg.asset.json";

type Slide =
  | { type: "text"; headline: string; subline: string; body: string }
  | { type: "image"; src: string; alt: string };

export function HorizontalGallery() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);

  const slides: Slide[] = [
    {
      type: "text",
      headline: t("gallery.s1.headline"),
      subline: t("gallery.s1.subline"),
      body: t("gallery.s1.body"),
    },
    { type: "image", src: cdnAssetUrl(a1.url), alt: t("gallery.alt1") },
    {
      type: "text",
      headline: t("gallery.s2.headline"),
      subline: t("gallery.s2.subline"),
      body: t("gallery.s2.body"),
    },
    { type: "image", src: cdnAssetUrl(a2.url), alt: t("gallery.alt2") },
    {
      type: "text",
      headline: t("gallery.s3.headline"),
      subline: t("gallery.s3.subline"),
      body: t("gallery.s3.body"),
    },
    { type: "image", src: cdnAssetUrl(a3.url), alt: t("gallery.alt3") },
  ];

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-66%"]);

  return (
    <section
      ref={sectionRef}
      className="relative h-[360vh] bg-ink"
      aria-label={t("gallery.kicker")}
    >
      <div className="sticky top-0 flex h-screen overflow-hidden">
        <motion.div style={{ x }} className="flex h-full items-center">
          <div className="flex h-full w-[80vw] shrink-0 items-center justify-center px-[6vw] sm:w-[40vw]">
            <p className="font-hand text-3xl italic tracking-widest text-saffron sm:text-4xl">
              {t("gallery.scrollHint")}
            </p>
          </div>

          {slides.map((s, i) =>
            s.type === "text" ? (
              <div
                key={i}
                className="flex h-full w-[85vw] shrink-0 flex-col justify-center gap-4 px-[6vw] sm:w-[50vw]"
              >
                <h2 className="font-display text-4xl font-light leading-[1] tracking-wide text-card sm:text-5xl md:text-6xl">
                  {s.headline}
                </h2>
                <h3 className="font-display text-4xl font-bold leading-[1] tracking-wide text-saffron sm:text-5xl md:text-6xl">
                  {s.subline}
                </h3>
                <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-card/70 sm:text-base">
                  {s.body}
                </p>
              </div>
            ) : (
              <div
                key={i}
                className="flex h-full w-[80vw] shrink-0 items-center px-[3vw] sm:w-[45vw]"
              >
                <div className="h-[75vh] w-full overflow-hidden rounded-2xl shadow-card">
                  <img
                    src={s.src}
                    alt={s.alt}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            ),
          )}

          <div className="flex h-full w-[70vw] shrink-0 items-center justify-center px-[4vw] sm:w-[30vw]">
            <p className="text-center font-hand text-3xl italic tracking-wider text-saffron sm:text-4xl">
              {t("gallery.outro")}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
