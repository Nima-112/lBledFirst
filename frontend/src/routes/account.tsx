import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  CalendarCheck,
  Star,
  LogOut,
  Trash2,
  ArrowLeft,
  MapPin,
  User as UserIcon,
} from "lucide-react";
import { Logo } from "@/components/landing/Logo";
import { LanguageSelector } from "@/components/landing/LanguageSelector";
import { I18nProvider } from "@/lib/i18n";
import {
  AuthProvider,
  useAuth,
  getBookings,
  saveBookings,
  getReviews,
  saveReviews,
  experienceById,
  experienceTitle,
  type MockBooking,
  type MockReview,
} from "@/lib/mock-auth";
import {
  fieldCls,
  PanelHeader,
  IconBtn,
  Field,
  Modal,
  StatCard,
  StatusBadge,
  Stars,
} from "@/components/dashboard/ui";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "Mon compte — L'Bled First" }] }),
  component: AccountRoute,
});

function AccountRoute() {
  return (
    <I18nProvider>
      <AuthProvider>
        <AccountGuard />
      </AuthProvider>
    </I18nProvider>
  );
}

function AccountGuard() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !user) navigate({ to: "/auth" });
    else if (ready && user && user.role === "admin") {
      navigate({ to: "/admin" });
    }
  }, [ready, user, navigate]);

  if (!ready || !user || user.role !== "tourist") {
    return <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">…</div>;
  }
  return <Account />;
}

function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const touristId = user!.id;

  const [bookings, setBookings] = useState<MockBooking[]>([]);
  const [reviews, setReviews] = useState<MockReview[]>([]);
  const [reviewFor, setReviewFor] = useState<MockBooking | null>(null);
  const [draft, setDraft] = useState({ rating: 5, comment: "" });

  useEffect(() => {
    setBookings(getBookings());
    setReviews(getReviews());
  }, []);

  const myBookings = useMemo(() => bookings.filter((b) => b.touristId === touristId), [bookings, touristId]);
  const myReviews = useMemo(() => reviews.filter((r) => r.touristId === touristId), [reviews, touristId]);
  const spent = myBookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + b.totalPrice, 0);

  const cancelBooking = (id: string) => {
    if (!confirm("Annuler cette réservation ?")) return;
    const next = bookings.map((b) => (b.id === id ? { ...b, status: "cancelled" as const } : b));
    setBookings(next);
    saveBookings(next);
  };

  const reviewedExp = new Set(myReviews.map((r) => r.experienceId));

  const submitReview = () => {
    if (!reviewFor || !draft.comment) return;
    const next: MockReview[] = [
      ...reviews,
      {
        id: `r-${Date.now()}`,
        touristId,
        experienceId: reviewFor.experienceId,
        rating: draft.rating,
        comment: draft.comment,
        createdAt: new Date().toISOString(),
      },
    ];
    setReviews(next);
    saveReviews(next);
    setReviewFor(null);
    setDraft({ rating: 5, comment: "" });
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-600 sm:inline-flex">
              <UserIcon className="h-3.5 w-3.5" /> Touriste
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <button onClick={() => { logout(); navigate({ to: "/" }); }} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted">
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Explorer les expériences
        </Link>

        <PanelHeader title={`Bonjour, ${user?.fullName.split(" ")[0]}`} subtitle="Vos réservations et vos avis." />

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={<CalendarCheck className="h-5 w-5" />} label="Réservations" value={String(myBookings.length)} tone="primary" />
          <StatCard icon={<Star className="h-5 w-5" />} label="Avis publiés" value={String(myReviews.length)} tone="saffron" />
          <StatCard icon={<MapPin className="h-5 w-5" />} label="Total dépensé" value={`${spent.toLocaleString()} MAD`} tone="emerald" />
        </div>

        <h3 className="mb-3 mt-8 font-display text-lg font-bold text-foreground">Mes réservations</h3>
        <div className="space-y-3">
          {myBookings.length === 0 && <p className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">Aucune réservation.</p>}
          {myBookings.map((b) => {
            const ex = experienceById(b.experienceId);
            const canReview = b.status === "completed" && !reviewedExp.has(b.experienceId);
            return (
              <div key={b.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{ex?.title ?? "—"}</p>
                  <p className="text-sm text-muted-foreground">{ex?.region} · {b.date} · {b.guests} voyageur(s)</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">{b.totalPrice} MAD</span>
                  <StatusBadge status={b.status} />
                  {canReview && (
                    <button onClick={() => setReviewFor(b)} className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:scale-105">
                      Laisser un avis
                    </button>
                  )}
                  {(b.status === "pending" || b.status === "confirmed") && (
                    <IconBtn onClick={() => cancelBooking(b.id)} label="Annuler" danger><Trash2 className="h-4 w-4" /></IconBtn>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <h3 className="mb-3 mt-8 font-display text-lg font-bold text-foreground">Mes avis</h3>
        <div className="space-y-3">
          {myReviews.length === 0 && <p className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">Vous n'avez pas encore laissé d'avis.</p>}
          {myReviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">{experienceTitle(r.experienceId)}</p>
                <Stars rating={r.rating} />
              </div>
              <p className="mt-2 text-sm text-foreground">{r.comment}</p>
            </div>
          ))}
        </div>
      </div>

      <Modal open={!!reviewFor} title="Laisser un avis" onClose={() => setReviewFor(null)} onSave={submitReview}>
        <p className="text-sm text-muted-foreground">{reviewFor ? experienceTitle(reviewFor.experienceId) : ""}</p>
        <Field label="Note">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setDraft({ ...draft, rating: n })} className={`text-2xl ${n <= draft.rating ? "text-saffron" : "text-border"}`}>
                ★
              </button>
            ))}
          </div>
        </Field>
        <Field label="Commentaire"><textarea rows={4} className={fieldCls} value={draft.comment} onChange={(e) => setDraft({ ...draft, comment: e.target.value })} /></Field>
      </Modal>
    </div>
  );
}
