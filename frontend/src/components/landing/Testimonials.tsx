import { motion } from "framer-motion";
import { Reveal, SectionHeading } from "./Reveal";
import { cdnAssetUrl } from "@/lib/asset-url";
import tourist1 from "@/assets/testimonials/camille.jpg.asset.json";
import tourist2 from "@/assets/testimonials/kenji.jpg.asset.json";
import tourist3 from "@/assets/testimonials/lucia.jpg.asset.json";
import { useI18n } from "@/lib/i18n";

const testimonials = [
  {
    image: cdnAssetUrl(tourist1.url),
    name: "Camille D.",
    place: "Lyon, France",
    flag: "🇫🇷",
    quote: "On a vécu une vraie journée berbère dans l'Atlas — du thé au lever du soleil jusqu'au tagine. Rien de touristique, que de l'humain.",
    rotate: -4,
  },
  {
    image: cdnAssetUrl(tourist2.url),
    name: "Kenji T.",
    place: "Osaka, Japan",
    flag: "🇯🇵",
    quote: "サハラ砂漠での夕食は一生忘れません。言葉の壁もアプリの翻訳で全く問題なし。最高の体験でした。",
    rotate: 3,
  },
  {
    image: cdnAssetUrl(tourist3.url),
    name: "Lucía M.",
    place: "Sevilla, España",
    flag: "🇪🇸",
    quote: "Aprendí a hacer cerámica con una familia del valle del Souss. Me fui con las manos llenas de barro y el corazón lleno.",
    rotate: -2,
  },
];

export function Testimonials() {
  const { t } = useI18n();

  return (
    <section className="bg-secondary/5 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading kicker={t("testi.kicker")} title={t("testi.title")} />

        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((tm, i) => (
            <Reveal key={tm.name} delay={i * 0.12}>
              <motion.figure
                initial={{ rotate: tm.rotate }}
                whileHover={{ rotate: 0, y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                className="mx-auto max-w-sm rounded-sm bg-card p-3 pb-5 shadow-card ring-1 ring-border"
                dir="ltr"
              >
                <div className="overflow-hidden">
                  <img
                    src={tm.image}
                    alt={tm.name}
                    loading="lazy"
                    className="h-64 w-full object-cover"
                  />
                </div>
                <figcaption className="px-2 pt-4">
                  <p className="font-hand text-xl leading-snug text-foreground">“{tm.quote}”</p>
                  <div className="mt-3 flex items-center gap-2 border-t border-dashed border-border pt-3">
                    <span className="text-xl">{tm.flag}</span>
                    <span className="text-sm font-bold">{tm.name}</span>
                    <span className="text-sm text-muted-foreground">· {tm.place}</span>
                  </div>
                </figcaption>
              </motion.figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
