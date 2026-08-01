import { IconBtn, PanelHeader } from "@/components/dashboard/ui";
import { BookingStatus, experienceTitle, MockBooking, userName } from "@/lib/mock-auth";
import { Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

const BOOKING_STATUSES: BookingStatus[] = ["pending", "confirmed", "cancelled", "completed"];

export function BookingsPanel({
  bookings,
  onChange,
}: {
  bookings: MockBooking[];
  onChange: (b: MockBooking[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      if (filter !== "all" && b.status !== filter) return false;
      if (!q) return true;
      return (
        userName(b.touristId).toLowerCase().includes(q) ||
        experienceTitle(b.experienceId).toLowerCase().includes(q)
      );
    });
  }, [bookings, query, filter]);

  const setStatus = (id: string, status: BookingStatus) =>
    onChange(bookings.map((b) => (b.id === id ? { ...b, status } : b)));

  const remove = (id: string) => {
    if (confirm("Supprimer cette réservation ?")) onChange(bookings.filter((b) => b.id !== id));
  };

  return (
    <section>
      <PanelHeader
        title="Réservations"
        subtitle="Gérez et suivez l'ensemble des réservations."
        query={query}
        setQuery={setQuery}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", ...BOOKING_STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition ${
              filter === s
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            {s === "all" ? "Toutes" : s}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="hidden grid-cols-[1.4fr_1fr_0.8fr_0.7fr_0.9fr_auto] gap-4 border-b border-border bg-muted/50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
          <span>Expérience</span>
          <span>Touriste</span>
          <span>Date</span>
          <span>Montant</span>
          <span>Statut</span>
          <span className="text-end">Actions</span>
        </div>
        {filtered.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            Aucune réservation.
          </p>
        )}
        {filtered.map((b) => (
          <div
            key={b.id}
            className="grid grid-cols-1 gap-2 border-b border-border px-5 py-4 last:border-0 md:grid-cols-[1.4fr_1fr_0.8fr_0.7fr_0.9fr_auto] md:items-center md:gap-4"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">
                {experienceTitle(b.experienceId)}
              </p>
              <p className="truncate text-xs text-muted-foreground">{b.guests} voyageur(s)</p>
            </div>
            <span className="text-sm text-foreground">{userName(b.touristId)}</span>
            <span className="text-sm text-foreground">{b.date}</span>
            <span className="text-sm font-semibold text-foreground">{b.totalPrice} MAD</span>
            <select
              value={b.status}
              onChange={(e) => setStatus(b.id, e.target.value as BookingStatus)}
              className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-semibold capitalize outline-none"
            >
              {BOOKING_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1.5 md:justify-end">
              <IconBtn onClick={() => remove(b.id)} label="Supprimer" danger>
                <Trash2 className="h-4 w-4" />
              </IconBtn>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}