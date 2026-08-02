import { MessageSquare, Star, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IconBtn, PanelHeader, StatusBadge } from "@/components/dashboard/ui";
import {
  FrontReview,
  deleteReview,
  getReviewsList,
} from "@/services/reviews.service";
import { getExperiencesList } from "@/services/experiences.service";
import { getUsersList } from "@/services/users.service";

const starArray = (n: number) => Array.from({ length: 5 }, (_, i) => i < Math.round(n));

export function ReviewsPanel() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [minRating, setMinRating] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);

  const reviewsQuery = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: getReviewsList,
  });
  const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: getUsersList });
  const experiencesQuery = useQuery({
    queryKey: ["admin-experiences"],
    queryFn: getExperiencesList,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });

  const reviews = reviewsQuery.data ?? [];
  const users = usersQuery.data ?? [];
  const experiences = experiencesQuery.data ?? [];

  const touristName = (id: string) =>
    users.find((u) => u.id === id)?.fullName ?? `Touriste #${id}`;
  const experienceTitle = (id: string) =>
    experiences.find((e) => e.id === id)?.title ?? `Expérience #${id}`;
  const experienceStatus = (id: string) =>
    experiences.find((e) => e.id === id)?.status ?? "draft";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reviews.filter((r) => {
      if (r.rating < minRating) return false;
      if (!q) return true;
      return (
        r.comment.toLowerCase().includes(q) ||
        touristName(r.touristId).toLowerCase().includes(q) ||
        experienceTitle(r.experienceId).toLowerCase().includes(q)
      );
    });
  }, [reviews, query, minRating, users, experiences]);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "—";

  const remove = (id: string) => {
    if (confirm("Supprimer cet avis ?")) deleteMutation.mutate(id);
  };

  const busy =
    reviewsQuery.isLoading ||
    deleteMutation.isPending;

  return (
    <section>
      <PanelHeader
        title="Avis clients"
        subtitle={`${reviews.length} avis · Note moyenne ${avgRating} / 5`}
        query={query}
        setQuery={setQuery}
      />

      <div className="mb-4 flex items-center gap-3 overflow-x-auto">
        {([0, 1, 2, 3, 4, 5] as const).map((n) => (
          <button
            key={n}
            onClick={() => setMinRating(n)}
            className={
              "inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition " +
              (minRating === n
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground")
            }
          >
            {n === 0 ? "Tout" : `${n}+`} <Star className="h-3 w-3 fill-current" />
          </button>
        ))}
      </div>

      {busy && (
        <p className="mb-4 text-sm text-muted-foreground">Chargement…</p>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {filtered.length === 0 && !reviewsQuery.isLoading && (
          <p className="col-span-full rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
            Aucun avis.
          </p>
        )}
        {filtered.map((r: FrontReview) => (
          <article key={r.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <header className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display font-bold text-primary">
                  {touristName(r.touristId).charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{touristName(r.touristId)}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {experienceTitle(r.experienceId)} ·{" "}
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {starArray(r.rating).map((on, i) => (
                  <Star
                    key={i}
                    className={"h-3.5 w-3.5 " + (on ? "fill-saffron text-saffron-foreground" : "text-muted")}
                  />
                ))}
              </div>
            </header>
            <div className="mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-sm leading-relaxed text-foreground/80">
                {r.comment || (
                  <span className="italic text-muted-foreground">Aucun commentaire.</span>
                )}
              </p>
            </div>
            <footer className="flex items-center justify-between border-t border-border pt-3">
              <StatusBadge status={experienceStatus(r.experienceId)} />
              <div className="flex items-center gap-1">
                <IconBtn
                  onClick={() => remove(r.id)}
                  label="Supprimer"
                  danger
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </IconBtn>
              </div>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}
