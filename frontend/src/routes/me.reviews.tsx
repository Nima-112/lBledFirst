import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { MeShell } from "@/components/me/MeShell";
import { useI18n } from "@/lib/i18n";
import { getMyReviews } from "@/services/reviews.service";

export const Route = createFileRoute("/me/reviews")({
  head: () => ({ meta: [{ title: "Mes avis — L'Bled First" }] }),
  component: MyReviews,
});

function MyReviews() {
  const { t } = useI18n();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["me", "reviews"],
    queryFn: getMyReviews,
  });

  const sorted = [...reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <MeShell title={t("me.reviews.title")}>
      {!isLoading && sorted.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">{t("me.reviews.empty")}</p>
        </div>
      )}

      <div className="space-y-3">
        {sorted.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              {r.experienceId ? (
                <Link
                  to="/experiences/$id"
                  params={{ id: r.experienceId }}
                  className="font-semibold text-foreground hover:text-primary"
                >
                  {r.experienceTitle ?? "—"}
                </Link>
              ) : r.formationId ? (
                <Link
                  to="/formations/$slug"
                  params={{ slug: r.formationSlug ?? "" }}
                  className="font-semibold text-foreground hover:text-primary"
                >
                  {r.formationTitle ?? "—"}{" "}
                  <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                    Formation
                  </span>
                </Link>
              ) : (
                <span className="font-semibold text-foreground">—</span>
              )}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`h-3.5 w-3.5 ${n <= r.rating ? "fill-saffron text-saffron" : "text-muted"}`}
                  />
                ))}
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground">{r.comment}</p>
          </div>
        ))}
      </div>
    </MeShell>
  );
}
