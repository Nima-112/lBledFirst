import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PlayCircle, Clock, GraduationCap, Compass } from "lucide-react";
import { MeShell } from "@/components/me/MeShell";
import { useI18n } from "@/lib/i18n";
import { formatDuration, totalCapsules } from "@/lib/formations";
import { getMyPurchasedFormations } from "@/services/formations.service";
export const Route = createFileRoute("/me/formations")({
  head: () => ({ meta: [{ title: "Mes formations — L'Bled First" }] }),
  component: MyFormations,
});
function MyFormations() {
  const { t } = useI18n();
  const { data: mine = [] } = useQuery({
    queryKey: ["formations", "purchased"],
    queryFn: getMyPurchasedFormations,
  });
  return (
    <MeShell title={t("me.formations.title")}>
      {mine.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">{t("me.formations.empty")}</p>
          <Link
            to="/formations"
            className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-warm transition hover:scale-[1.02]"
          >
            {t("me.formations.browse")}
          </Link>
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        {mine.map((f) => (
          <Link
            key={f.slug}
            to="/formations/$slug"
            params={{ slug: f.slug }}
            className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative aspect-video overflow-hidden">
              <img
                src={f.coverImage}
                alt={f.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
              <span className="absolute left-3 top-3 rounded-full bg-primary/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                {t("me.formations.enrolled")}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="font-display text-base font-bold leading-tight text-foreground">
                {f.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {f.shortDescription}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10px] font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1">
                  <Clock className="h-3 w-3" /> {formatDuration(f.totalDuration || 0)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1">
                  <PlayCircle className="h-3 w-3" /> {totalCapsules(f)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1">
                  <GraduationCap className="h-3 w-3" /> {f.level}
                </span>
              </div>
            </div>
          </Link>
        ))}

        {mine.length > 0 && (
          <Link
            to="/formations"
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-6 text-center transition hover:-translate-y-1 hover:bg-primary/10"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Compass className="h-6 w-6" />
            </span>
            <p className="font-display text-base font-bold text-foreground">
              {t("me.formations.browse")}
            </p>
            <p className="text-xs text-muted-foreground">{t("me.formations.discoverMore")}</p>
          </Link>
        )}
      </div>
    </MeShell>
  );
}
