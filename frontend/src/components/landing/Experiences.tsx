import { Reveal, SectionHeading } from "./Reveal";
import {
  HikingIcon,
  CraftsIcon,
  CuisineIcon,
  AgricultureIcon,
  FestivalsIcon,
  HomestaysIcon,
} from "./icons";
import { useI18n } from "@/lib/i18n";

export function Experiences() {
  const { t } = useI18n();

  const items = [
    { icon: HikingIcon, label: t("exp.hiking") },
    { icon: CraftsIcon, label: t("exp.crafts") },
    { icon: CuisineIcon, label: t("exp.cuisine") },
    { icon: AgricultureIcon, label: t("exp.agriculture") },
    { icon: FestivalsIcon, label: t("exp.festivals") },
    { icon: HomestaysIcon, label: t("exp.homestays") },
  ];

  return (
    <section id="experiences" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading kicker={t("exp.kicker")} title={t("exp.title")} />
      </div>

      {/* Horizontal scroll row */}
      <div className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:px-6 lg:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((it, i) => (
          <Reveal key={it.label} delay={i * 0.06}>
            <button className="group flex w-40 shrink-0 snap-center flex-col items-center gap-4 rounded-3xl border border-border bg-card p-6 text-center shadow-card transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 sm:w-44">
              <span className="grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-secondary transition-colors duration-300 group-hover:bg-primary/20">
                <it.icon className="h-11 w-11" />
              </span>
              <span className="text-lg font-bold">{it.label}</span>
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
