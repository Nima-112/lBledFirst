import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MeShell } from "@/components/me/MeShell";
import { Stars } from "@/components/dashboard/ui";
import { useI18n } from "@/lib/i18n";
import { useAuth, getReviews, experienceById, type MockReview } from "@/lib/mock-auth";

export const Route = createFileRoute("/me/reviews")({
  head: () => ({ meta: [{ title: "Mes avis — L'Bled First" }] }),
  component: MyReviews,
});

function MyReviews() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<MockReview[]>([]);

  useEffect(() => { setReviews(getReviews()); }, []);

  const mine = reviews.filter((r) => r.touristId === user?.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <MeShell title={t("me.reviews.title")}>
      {mine.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">{t("me.reviews.empty")}</p>
        </div>
      )}

      <div className="space-y-3">
        {mine.map((r) => {
          const ex = experienceById(r.experienceId);
          return (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <Link to="/experiences/$id" params={{ id: r.experienceId }} className="font-semibold text-foreground hover:text-primary">
                  {ex?.title ?? "—"}
                </Link>
                <Stars rating={r.rating} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</p>
              <p className="mt-3 text-sm leading-relaxed text-foreground">{r.comment}</p>
            </div>
          );
        })}
      </div>
    </MeShell>
  );
}
