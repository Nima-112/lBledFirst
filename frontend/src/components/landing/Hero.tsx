import { motion } from "framer-motion";
import { ArrowRight, Play, MapPin } from "lucide-react";
import heroAtlas from "@/assets/hero-atlas.jpg";
import heroVideo from "@/assets/hero-video.mp4.asset.json";
import { cdnAssetUrl } from "@/lib/asset-url";
import { useI18n } from "@/lib/i18n";

export function Hero({ onDiscover }: { onDiscover: () => void }) {
  const { t } = useI18n();
  const words = t("hero.title1").split(" ");

  return (
    <section id="top" className="relative flex min-h-[100svh] items-center overflow-hidden">
      {/* Cinematic video background */}
      <div className="absolute inset-0 z-0">
        <video
          className="h-full w-full object-cover"
          src={cdnAssetUrl(heroVideo.url)}
          poster={heroAtlas}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label="Rural Morocco landscapes"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/45 to-ink/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/60 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-24 pt-32 sm:px-6">
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-card/25 bg-card/10 px-4 py-1.5 text-sm font-medium text-card backdrop-blur-md"
          >
            <MapPin className="h-4 w-4 text-saffron" />
            {t("hero.kicker")}
          </motion.span>

          <h1 className="mt-6 text-balance text-5xl font-extrabold leading-[1.02] tracking-tight text-card sm:text-6xl md:text-7xl">
            <span className="inline-flex flex-wrap gap-x-4">
              {words.map((w, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 30, rotate: -3 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                >
                  {w}
                </motion.span>
              ))}
            </span>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="relative mt-1 block font-hand text-6xl text-saffron sm:text-7xl md:text-8xl"
            >
              {t("hero.title2")}
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-6 max-w-xl text-balance text-base text-card/85 sm:text-lg"
          >
            {t("hero.sub")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <button
              onClick={onDiscover}
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-warm transition-transform hover:scale-105"
            >
              {t("hero.cta")}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </button>
            <a
              href="#testimonials"
              className="inline-flex items-center gap-2 rounded-full border border-card/30 bg-card/10 px-6 py-3.5 text-base font-semibold text-card backdrop-blur-md transition-colors hover:bg-card/20"
            >
              <Play className="h-4 w-4 fill-current" />
              {t("hero.secondary")}
            </a>
          </motion.div>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute inset-x-0 bottom-6 flex justify-center"
      >
        <div className="flex flex-col items-center gap-2 text-card/70">
          <span className="text-xs uppercase tracking-[0.2em]">{t("hero.scroll")}</span>
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="flex h-9 w-5 items-start justify-center rounded-full border border-card/40 p-1"
          >
            <span className="h-2 w-1 rounded-full bg-card/70" />
          </motion.span>
        </div>
      </motion.div>
    </section>
  );
}
