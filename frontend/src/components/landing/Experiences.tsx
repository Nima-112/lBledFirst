import { useEffect, useState } from "react";
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
import { getActivitiesList, type FrontActivity } from "@/services/activities.service";
import type { ComponentType, SVGProps } from "react";

type SvgIcon = ComponentType<SVGProps<SVGSVGElement>>;

// Map backend icon identifiers to SVG components
const ICON_MAP: Record<string, SvgIcon> = {
  hiking: HikingIcon,
  crafts: CraftsIcon,
  cuisine: CuisineIcon,
  agriculture: AgricultureIcon,
  festivals: FestivalsIcon,
  homestays: HomestaysIcon,
  // aliases / fallbacks
  randonnée: HikingIcon,
  artisanat: CraftsIcon,
  gastronomie: CuisineIcon,
};

// Fallback icon when backend sends an unknown icon name
const FallbackIcon: SvgIcon = HikingIcon;

export function Experiences() {
  const { t } = useI18n();
  const [activities, setActivities] = useState<FrontActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getActivitiesList();
        if (!cancelled) setActivities(data);
      } catch {
        // On error, fallback to empty — section will just show the heading
        if (!cancelled) setActivities([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resolveIcon = (iconName: string) => {
    const key = iconName.toLowerCase().trim();
    return ICON_MAP[key] ?? FallbackIcon;
  };

  return (
    <section id="experiences" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading kicker={t("exp.kicker")} title={t("exp.title")} />
      </div>

      {/* Horizontal scroll row */}
      <div className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:px-6 lg:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex w-40 shrink-0 snap-center flex-col items-center gap-4 rounded-3xl border border-border bg-card p-6 text-center shadow-card animate-pulse sm:w-44"
              >
                <div className="h-20 w-20 rounded-full bg-muted" />
                <div className="h-5 w-2/3 rounded bg-muted" />
              </div>
            ))
          : activities.map((act, i) => {
              const Icon = resolveIcon(act.icon);
              return (
                <Reveal key={act.id} delay={i * 0.06}>
                  <button className="group flex w-40 shrink-0 snap-center flex-col items-center gap-4 rounded-3xl border border-border bg-card p-6 text-center shadow-card transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 sm:w-44">
                    <span className="grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-secondary transition-colors duration-300 group-hover:bg-primary/20">
                      <Icon className="h-11 w-11" />
                    </span>
                    <span className="text-lg font-bold">{act.name}</span>
                  </button>
                </Reveal>
              );
            })}
      </div>
    </section>
  );
}
