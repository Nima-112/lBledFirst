import { motion } from "framer-motion";
import { Compass, CalendarCheck, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import { Reveal, SectionHeading } from "./Reveal";
import { cdnAssetUrl } from "@/lib/asset-url";
import { useI18n } from "@/lib/i18n";
import atayVideo from "@/assets/atay.mp4.asset.json";

function useAutoplayVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute("muted", "");
    const tryPlay = () => {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };
    tryPlay();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) tryPlay();
        }
      },
      { threshold: 0.05 },
    );
    io.observe(v);
    v.addEventListener("canplay", tryPlay);
    v.addEventListener("loadeddata", tryPlay);
    return () => {
      io.disconnect();
      v.removeEventListener("canplay", tryPlay);
      v.removeEventListener("loadeddata", tryPlay);
    };
  }, []);
  return ref;
}

export function WhatIs() {
  const { t, lang } = useI18n();
  const mobileVideoRef = useAutoplayVideo();
  const desktopVideoRef = useAutoplayVideo();

  const cards = [
    { icon: Compass, t: t("what.discover.t"), d: t("what.discover.d"), n: "01" },
    { icon: CalendarCheck, t: t("what.book.t"), d: t("what.book.d"), n: "02" },
    { icon: Sparkles, t: t("what.experience.t"), d: t("what.experience.d"), n: "03" },
  ];

  const atayTitle =
    lang === "ar" ? "أتاي بالنعناع" : "Atay b Na3na3";
  const atayCaption =
    lang === "fr"
      ? "Le rituel du thé à la menthe — versé de haut, servi avec le sourire."
      : lang === "es"
        ? "El ritual del té con menta — servido desde lo alto, con una sonrisa."
        : lang === "ar"
          ? "طقس أتاي بالنعناع — يُصبّ من علوٍ، ويُقدَّم بابتسامة."
          : "The mint tea ritual — poured from high, served with a smile.";

  return (
    <section className="bg-grain relative overflow-hidden">
      {/* MOBILE / TABLET: full background video with text on top */}
      <div className="relative lg:hidden">
        <div className="absolute inset-0 z-0">
          <video
            ref={mobileVideoRef}
            src={cdnAssetUrl(atayVideo.url)}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="h-full w-full object-cover"
            aria-label="Moroccan mint tea being poured"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/60 to-ink/85" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-24">
          <SectionHeading
            kicker={t("what.kicker")}
            title={t("what.title")}
            sub={t("what.sub")}
            align="start"
            light
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-8 inline-flex flex-col gap-1 rounded-2xl border border-card/25 bg-card/10 px-5 py-3 backdrop-blur-md"
          >
            <span className="font-hand text-2xl text-saffron">{atayTitle}</span>
            <p className="text-sm leading-relaxed text-card/85">{atayCaption}</p>
          </motion.div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {cards.map((c, i) => (
              <Reveal key={c.t} delay={i * 0.1}>
                <div className="group relative h-full overflow-hidden rounded-3xl border border-card/20 bg-card/10 p-5 backdrop-blur-md transition-transform duration-300 hover:-translate-y-1.5">
                  <span className="font-hand absolute end-4 top-2 text-4xl text-saffron/25">
                    {c.n}
                  </span>
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-saffron">
                    <c.icon className="h-6 w-6" />
                  </span>
                  <div className="mt-4">
                    <h3 className="text-xl font-bold text-card">{c.t}</h3>
                    <p className="mt-2 text-sm text-card/80">{c.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* DESKTOP: split layout with video on the right */}
      <div className="relative hidden py-20 sm:py-28 lg:block">
        <div className="pointer-events-none absolute right-0 top-[5%] bottom-[5%] w-[60%]">
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
            <video
              ref={desktopVideoRef}
              src={cdnAssetUrl(atayVideo.url)}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="h-full w-full object-cover"
              style={{ objectPosition: "28% center" }}
              aria-label="Moroccan mint tea being poured"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/25 via-transparent to-background/10" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="absolute bottom-8 right-6 max-w-[16rem] rounded-2xl border border-border/60 bg-card/85 p-4 shadow-card backdrop-blur-md"
            >
              <span className="font-hand text-2xl text-primary">{atayTitle}</span>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{atayCaption}</p>
            </motion.div>
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-[60%]">
            <SectionHeading
              kicker={t("what.kicker")}
              title={t("what.title")}
              sub={t("what.sub")}
              align="start"
            />
          </div>

          <div className="mt-14 grid max-w-[60%] gap-5 md:grid-cols-3">
            {cards.map((c, i) => (
              <Reveal key={c.t} delay={i * 0.1}>
                <div className="group relative h-full overflow-hidden rounded-3xl border border-border bg-card/90 p-6 shadow-card backdrop-blur-md transition-transform duration-300 hover:-translate-y-1.5">
                  <span className="font-hand absolute end-5 top-3 text-5xl text-primary/15">
                    {c.n}
                  </span>
                  <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-secondary">
                    <c.icon className="h-7 w-7" />
                  </span>
                  <div className="mt-5">
                    <h3 className="text-2xl font-bold">{c.t}</h3>
                    <p className="mt-2 text-muted-foreground">{c.d}</p>
                  </div>
                  <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-primary to-saffron transition-transform duration-300 group-hover:scale-x-100" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

