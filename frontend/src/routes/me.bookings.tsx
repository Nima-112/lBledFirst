import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, Star } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MeShell } from "@/components/me/MeShell";
import { StatusBadge, Modal, Field, fieldCls } from "@/components/dashboard/ui";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/context/AuthContext";
import { getMyBookings, cancelBooking } from "@/services/bookings.service";
import type { FrontBooking } from "@/services/bookings.service";
import { getMyReviews, createExperienceReview } from "@/services/reviews.service";

export const Route = createFileRoute("/me/bookings")({
  head: () => ({ meta: [{ title: "Mes réservations — L'Bled First" }] }),
  component: MyBookings,
});

function MyBookings() {
  const { t } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [reviewFor, setReviewFor] = useState<FrontBooking | null>(null);
  const [draft, setDraft] = useState({ rating: 5, comment: "" });

  const { data: mine = [], isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: getMyBookings,
    enabled: !!user,
  });

  const { data: myReviews = [] } = useQuery({
    queryKey: ["my-reviews"],
    queryFn: getMyReviews,
    enabled: !!user,
  });

  const reviewed = new Set(myReviews.map((r) => r.experienceId));

  const cancelMutation = useMutation({
    mutationFn: async (booking: FrontBooking) => {
      return cancelBooking(booking.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
  });

  const cancel = (booking: FrontBooking) => {
    if (!confirm(t("me.bookings.cancel.confirm"))) return;
    cancelMutation.mutate(booking);
  };

  const reviewMutation = useMutation({
    mutationFn: async () => {
      if (!reviewFor || !user) throw new Error("Missing info");
      return createExperienceReview(reviewFor.experienceId, draft.rating, draft.comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
      setReviewFor(null);
      setDraft({ rating: 5, comment: "" });
    }
  });

  const submitReview = () => {
    if (!reviewFor || !user || !draft.comment.trim()) return;
    reviewMutation.mutate();
  };

  return (
    <MeShell title={t("me.bookings.title")}>
      {isLoading ? (
        <div className="py-10 text-center text-sm text-muted-foreground">Chargement...</div>
      ) : mine.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">{t("me.bookings.empty")}</p>
          <Link to="/" className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-warm transition hover:scale-[1.02]">
            {t("me.bookings.browse")}
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          {mine.map((b) => {
            const canReview = b.status === "completed" && !reviewed.has(b.experienceId);
            return (
              <div key={b.id} className="grid gap-3 border-b border-border px-5 py-4 last:border-0 sm:grid-cols-[1.4fr_1fr_auto] sm:items-center">
                <div className="min-w-0">
                  <Link to="/experiences/$id" params={{ id: b.experienceId }} className="truncate font-semibold text-foreground hover:text-primary">
                    {b.experienceTitle ?? "—"}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">{b.date} · {b.guests} {t("me.bookings.guests")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={b.status} />
                  <span className="text-sm font-semibold text-foreground">{b.totalPrice} MAD</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  {canReview && (
                    <button
                      onClick={() => setReviewFor(b)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-saffron/15 px-3 py-1.5 text-xs font-semibold text-saffron transition hover:bg-saffron/25"
                    >
                      <Star className="h-3.5 w-3.5" /> {t("me.bookings.review")}
                    </button>
                  )}
                  {(b.status === "pending" || b.status === "confirmed") && (
                    <button
                      onClick={() => cancel(b)}
                      disabled={cancelMutation.isPending}
                      className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive transition hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> {t("me.bookings.cancel")}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!reviewFor} title={t("me.bookings.reviewTitle")} onClose={() => setReviewFor(null)} onSave={submitReview} saving={reviewMutation.isPending}>
        <p className="text-sm text-muted-foreground">{reviewFor?.experienceTitle}</p>
        <Field label={t("me.bookings.rating")}>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setDraft({ ...draft, rating: n })} className={`text-2xl ${n <= draft.rating ? "text-saffron" : "text-border"}`}>
                ★
              </button>
            ))}
          </div>
        </Field>
        <Field label={t("me.bookings.comment")}>
          <textarea rows={4} className={fieldCls} value={draft.comment} onChange={(e) => setDraft({ ...draft, comment: e.target.value })} />
        </Field>
      </Modal>
    </MeShell>
  );
}
