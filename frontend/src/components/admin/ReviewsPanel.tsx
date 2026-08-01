import { PanelHeader, Stars, StatusBadge } from "@/components/dashboard/ui";
import { experienceTitle, MockExperience, MockReview, userName } from "@/lib/mock-auth";
import { useMemo, useState } from "react";

export function ReviewsPanel({
  experiences,
  reviews,
  onChange,
}: {
  experiences: MockExperience[];
  reviews: MockReview[];
  onChange: (e: MockExperience[]) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter(
      (r) =>
        experienceTitle(r.experienceId).toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q),
    );
  }, [reviews, query]);

  const toggleStatus = (e: MockExperience) =>
    onChange(
      experiences.map((x) =>
        x.id === e.id ? { ...x, status: x.status === "published" ? "archived" : "published" } : x,
      ),
    );

  return (
    <section>
      <PanelHeader
        title="Expériences & avis"
        subtitle="Consultez les retours des touristes et modérez les expériences."
        query={query}
        setQuery={setQuery}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {experiences.map((e) => (
          <article key={e.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {e.category}
                </p>
                <h3 className="mt-0.5 truncate font-display text-base font-bold text-foreground">
                  {e.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {e.region} · {e.price} MAD
                </p>
              </div>
              <StatusBadge status={e.status} />
            </div>
            <button
              onClick={() => toggleStatus(e)}
              className="mt-3 w-full rounded-full border border-border py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
            >
              {e.status === "published" ? "Archiver" : "Publier"}
            </button>
          </article>
        ))}
      </div>

      <h3 className="mb-3 font-display text-lg font-bold text-foreground">Avis des utilisateurs</h3>
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
            Aucun avis.
          </p>
        )}
        {filtered.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">{userName(r.touristId)}</p>
              <Stars rating={r.rating} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {experienceTitle(r.experienceId)} ·{" "}
              {new Date(r.createdAt).toLocaleDateString("fr-FR")}
            </p>
            <p className="mt-2 text-sm text-foreground">{r.comment}</p>
          </div>
        ))}
      </div>
    </section>
  );
}