import { CalendarCheck, DollarSign, GraduationCap, MapPin, Star, UserCheck, Users } from "lucide-react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { BarChart, PanelHeader, StatCard, StatusBadge } from "@/components/dashboard/ui";
import { getUsersList } from "@/services/users.service";
import { getExperiencesList } from "@/services/experiences.service";
import { getBookingsList } from "@/services/bookings.service";
import { getReviewsList } from "@/services/reviews.service";
import { getFormationsList } from "@/services/formations.service";
import type { Formation } from "@/lib/formations";
import { getFormationEnrollments } from "@/services/formation-enrollments.service";

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export function DashboardPanel() {
  const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: getUsersList });
  const experiencesQuery = useQuery({
    queryKey: ["admin-experiences"],
    queryFn: getExperiencesList,
  });
  const bookingsQuery = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: getBookingsList,
  });
  const reviewsQuery = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: getReviewsList,
  });
  const formationsQuery = useQuery<Formation[]>({
    queryKey: ["admin-formations"],
    queryFn: getFormationsList,
  });
  const enrollmentsQuery = useQuery({
    queryKey: ["admin-enrollments"],
    queryFn: getFormationEnrollments,
  });

  const users = usersQuery.data ?? [];
  const experiences = experiencesQuery.data ?? [];
  const bookings = bookingsQuery.data ?? [];
  const reviews = reviewsQuery.data ?? [];
  const formations = formationsQuery.data ?? [];

  void formationsQuery;

  const enrollments = enrollmentsQuery.data ?? [];

  const bookingRevenue = bookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((s, b) => s + b.totalPrice, 0);

  const formationRevenue = enrollments
    .reduce((s, e) => s + (e.formationPrice ?? 0), 0);

  const revenue = bookingRevenue + formationRevenue;

  const totalTourists = users.filter((u) => u.role === "tourist").length;
  const publishedExperiences = experiences.filter((e) => e.status === "published").length;
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "—";

  const bookingsByStatus: { label: string; value: number }[] = (
    ["pending", "confirmed", "completed", "cancelled"] as BookingStatus[]
  ).map((s) => ({
    label:
      s === "pending"
        ? "Attente"
        : s === "confirmed"
          ? "Confirmé"
          : s === "completed"
            ? "Terminé"
            : "Annulé",
    value: bookings.filter((b) => b.status === s).length,
  }));

  const topRegions = useMemo(() => {
    const map = new Map<string, number>();
    bookings.forEach((b) => {
      const region = experiences.find((e) => e.id === b.experienceId)?.region ?? "—";
      map.set(region, (map.get(region) ?? 0) + 1);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [bookings, experiences]);

  const experienceById = (id: string) => experiences.find((e) => e.id === id);
  const touristName = (id: string) => users.find((u) => u.id === id)?.fullName ?? `#${id}`;

  const loading =
    usersQuery.isLoading ||
    experiencesQuery.isLoading ||
    bookingsQuery.isLoading ||
    reviewsQuery.isLoading ||
    enrollmentsQuery.isLoading;

  return (
    <section>
      <PanelHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble de la plateforme en temps réel."
      />

      {loading && (
        <p className="mb-4 text-sm text-muted-foreground">Chargement des données…</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={<CalendarCheck className="h-5 w-5" />}
          label="Réservations totales"
          value={String(bookings.length)}
          hint="+ ce mois"
          tone="primary"
        />
        <StatCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Revenus générés"
          value={`${revenue.toLocaleString()} MAD`}
          tone="emerald"
        />
        <StatCard
          icon={<UserCheck className="h-5 w-5" />}
          label="Touristes inscrits"
          value={String(totalTourists)}
          tone="saffron"
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Expériences publiées"
          value={String(publishedExperiences)}
          tone="sky"
        />

        <StatCard
          icon={<Star className="h-5 w-5" />}
          label="Note moyenne"
          value={`${avgRating} / 5`}
          hint={`${reviews.length} avis`}
          tone="saffron"
        />
        <StatCard
          icon={<GraduationCap className="h-5 w-5" />}
          label="Formations totales"
          value={String(formations.length)}
          hint="Catalogue Academy"
          tone="primary"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="mb-4 font-display text-base font-bold text-foreground">
            Réservations par statut
          </h3>
          <BarChart data={bookingsByStatus} />
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="mb-4 font-display text-base font-bold text-foreground">
            Top régions réservées
          </h3>
          <div className="space-y-3">
            {topRegions.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucune donnée.</p>
            )}
            {topRegions.map(([region, count], i) => {
              const max = topRegions[0]?.[1] ?? 1;
              return (
                <div key={region}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> {region}
                    </span>
                    <span className="font-semibold text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-saffron"
                      style={{ width: `${(count / max) * 100}%`, opacity: 1 - i * 0.12 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-card">
        <h3 className="mb-4 font-display text-base font-bold text-foreground">
          Dernières réservations
        </h3>
        <div className="space-y-2">
          {bookings.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucune réservation.</p>
          )}
          {bookings
            .slice(-4)
            .reverse()
            .map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">
                    {experienceById(b.experienceId)?.title ?? `Expérience #${b.experienceId}`}
                  </p>
                  <p className="truncate text-muted-foreground">
                    {touristName(b.touristId)} · {b.date.slice(0, 10)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">{b.totalPrice} MAD</span>
                  <StatusBadge status={b.status} />
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
