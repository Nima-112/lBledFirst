import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Clock, BookOpen, Users, Star, GraduationCap, Compass } from "lucide-react";
import { MeShell } from "@/components/me/MeShell";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/context/AuthContext";
import { getMyFavoriteExperiences, toggleExperienceFavoriteApi } from "@/services/experiences.service";
import { getMyFavoriteFormations, toggleFormationFavoriteApi } from "@/services/formations.service";
import { ExperienceCard } from "@/routes/experiences";
import { resolveUploadUrl } from "@/lib/asset-url";
import { formatDuration } from "@/lib/formations";

export const Route = createFileRoute("/me/favorites")({
  head: () => ({ meta: [{ title: "Mes favoris — L'Bled First" }] }),
  component: MyFavoritesPage,
});

function MyFavoritesPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"experiences" | "formations">("experiences");

  const { data: experiences = [], isLoading: loadingExp } = useQuery({
    queryKey: ["experiences", "favorites"],
    queryFn: getMyFavoriteExperiences,
    enabled: !!user,
  });

  const { data: formations = [], isLoading: loadingForm } = useQuery({
    queryKey: ["formations", "favorites"],
    queryFn: getMyFavoriteFormations,
    enabled: !!user,
  });

  const toggleExpFavorite = useMutation({
    mutationFn: toggleExperienceFavoriteApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiences", "favorites"] });
    },
  });

  const toggleFormFavorite = useMutation({
    mutationFn: toggleFormationFavoriteApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formations", "favorites"] });
    },
  });

  const handleOpenExperience = (id: string) => {
    navigate({ to: "/experiences/$id", params: { id } });
  };

  return (
    <MeShell title={t("nav.me.favorites")}>
      {/* Sub-tabs */}
      <div className="mb-6 flex gap-4 border-b border-border">
        <button
          type="button"
          onClick={() => setTab("experiences")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
            tab === "experiences"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Compass className="h-4 w-4" />
          Experiences
        </button>
        <button
          type="button"
          onClick={() => setTab("formations")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
            tab === "formations"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          Trainings
        </button>
      </div>

      {tab === "experiences" ? (
        loadingExp ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-3xl border border-border bg-card" />
            ))}
          </div>
        ) : experiences.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <Heart className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">You don't have any favorite experiences yet.</p>
            <Link
              to="/experiences"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-warm transition hover:scale-[1.01]"
            >
              Browse experiences
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.map((e, index) => (
              <ExperienceCard
                key={e.id}
                exp={e}
                index={index}
                onOpen={handleOpenExperience}
                isFavorited={true}
                onToggleFavorite={(id) => toggleExpFavorite.mutate(id)}
              />
            ))}
          </div>
        )
      ) : loadingForm ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-3xl border border-border bg-card" />
          ))}
        </div>
      ) : formations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <Heart className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">You don't have any favorite trainings yet.</p>
          <Link
            to="/formations"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-warm transition hover:scale-[1.01]"
          >
            Browse trainings
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {formations.map((f) => (
            <article
              key={f.slug}
              className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-warm"
            >
              <div className="relative h-52 overflow-hidden">
                <Link to="/formations/$slug" params={{ slug: f.slug }}>
                  <img
                    src={resolveUploadUrl(f.coverImage) || f.coverImage}
                    alt={f.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                </Link>
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent pointer-events-none" />
                <button
                  onClick={() => toggleFormFavorite.mutate(f.slug)}
                  className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-primary shadow-card backdrop-blur transition hover:scale-110"
                  aria-label="Retirer des favoris"
                >
                  <Heart className="h-4 w-4 fill-primary" />
                </button>
                <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
                  <span className="rounded-md bg-background/80 px-2 py-0.5 text-[10px] font-bold text-foreground">
                    {f.category}
                  </span>
                  <span className="rounded-md bg-secondary/80 px-2 py-0.5 text-[10px] font-bold text-secondary-foreground">
                    {f.level}
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <Link to="/formations/$slug" params={{ slug: f.slug }}>
                  <h3 className="font-display text-xl font-bold leading-tight text-foreground hover:text-primary transition-colors">
                    {f.title}
                  </h3>
                </Link>
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                  {f.shortDescription}
                </p>

                <div className="mt-4 flex items-center gap-3 border-t border-border/70 pt-4">
                  <img
                    src={resolveUploadUrl(f.instructor.photo) || f.instructor.photo}
                    alt={f.instructor.name}
                    className="h-9 w-9 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {f.instructor.name}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {f.instructor.specialty}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground border-t border-border/40 pt-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>{formatDuration(f.totalDuration)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                    <span>{f.capsulesCount ?? 0} caps.</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <span>{f.studentsCount}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between border-t border-border/40 pt-4">
                  <div className="flex items-center gap-1 text-saffron">
                    <Star className="h-4 w-4 fill-saffron" />
                    <span className="text-sm font-bold text-foreground">
                      {f.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="font-display text-lg font-bold text-primary">
                    {f.price} MAD
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </MeShell>
  );
}
