import {
  Calendar,
  Pencil,
  Trash2,
  Users as UsersIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Field, fieldCls, IconBtn, Modal, PanelHeader, StatusBadge } from "@/components/dashboard/ui";
import {
  FrontBooking,
  createBooking,
  deleteBooking,
  getBookingsList,
  updateBooking,
} from "@/services/bookings.service";
import { getExperiencesList } from "@/services/experiences.service";
import { getUsersList } from "@/services/users.service";

type BookingStatus = FrontBooking["status"];

type DraftBooking = {
  touristId: string;
  experienceId: string;
  date: string;
  status: BookingStatus;
  totalPrice: string;
  guests: string;
};

const EMPTY: DraftBooking = {
  touristId: "",
  experienceId: "",
  date: new Date().toISOString().slice(0, 10),
  status: "pending",
  totalPrice: "",
  guests: "1",
};

const STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmée" },
  { value: "completed", label: "Terminée" },
  { value: "cancelled", label: "Annulée" },
];

export function BookingsPanel() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<DraftBooking>(EMPTY);
  const [filterStatus, setFilterStatus] = useState<"all" | BookingStatus>("all");

  const bookingsQuery = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: getBookingsList,
  });
  const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: getUsersList });
  const experiencesQuery = useQuery({
    queryKey: ["admin-experiences"],
    queryFn: getExperiencesList,
  });

  const createMutation = useMutation({
    mutationFn: (b: FrontBooking) => createBooking(b),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      setCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FrontBooking }) =>
      updateBooking(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-bookings"] }),
  });

  const bookings = bookingsQuery.data ?? [];
  const users = usersQuery.data ?? [];
  const experiences = experiencesQuery.data ?? [];

  const touristName = (id: string) =>
    users.find((u) => u.id === id)?.fullName ?? `Touriste #${id}`;
  const experienceTitle = (id: string) =>
    experiences.find((e) => e.id === id)?.title ?? `Expérience #${id}`;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      if (filterStatus !== "all" && b.status !== filterStatus) return false;
      if (!q) return true;
      return (
        b.date.includes(q) ||
        touristName(b.touristId).toLowerCase().includes(q) ||
        experienceTitle(b.experienceId).toLowerCase().includes(q)
      );
    });
  }, [bookings, query, filterStatus, users, experiences]);

  const startCreate = () => {
    setDraft(EMPTY);
    setCreating(true);
  };
  const startEdit = (b: FrontBooking) => {
    setDraft({
      touristId: b.touristId,
      experienceId: b.experienceId,
      date: b.date.slice(0, 10),
      status: b.status,
      totalPrice: String(b.totalPrice),
      guests: String(b.guests ?? 1),
    });
    setEditingId(b.id);
  };

  const save = async () => {
    if (!draft.touristId || !draft.experienceId || !draft.date) return;
    const payload: FrontBooking = {
      id: editingId ?? "",
      touristId: draft.touristId,
      experienceId: draft.experienceId,
      date: draft.date,
      status: draft.status,
      totalPrice: Number(draft.totalPrice) || 0,
      guests: Number(draft.guests) || 1,
      createdAt: new Date().toISOString(),
    };
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const updateStatus = async (b: FrontBooking, status: BookingStatus) => {
    await updateMutation.mutateAsync({
      id: b.id,
      data: { ...b, status },
    });
  };

  const remove = (id: string) => {
    if (confirm("Supprimer cette réservation ?")) deleteMutation.mutate(id);
  };

  const busy =
    bookingsQuery.isLoading ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <section>
      <PanelHeader
        title="Réservations"
        subtitle="Gérez les réservations et leurs statuts."
        query={query}
        setQuery={setQuery}
        onAdd={startCreate}
        addLabel="Nouvelle réservation"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={
              "rounded-full border px-3 py-1 text-xs font-medium transition " +
              (filterStatus === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground")
            }
          >
            {s === "all"
              ? "Tout"
              : s === "pending"
                ? "Attente"
                : s === "confirmed"
                  ? "Confirmé"
                  : s === "completed"
                    ? "Terminé"
                    : "Annulé"}
          </button>
        ))}
      </div>

      {busy && (
        <p className="mb-4 text-sm text-muted-foreground">Chargement…</p>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/30 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Touriste</th>
              <th className="px-4 py-3 font-semibold">Expérience</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Voyageurs</th>
              <th className="px-4 py-3 font-semibold">Prix</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && !bookingsQuery.isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  Aucune réservation.
                </td>
              </tr>
            )}
            {filtered.map((b) => {
              const expDeleted = !!b.experienceDeleted;
              return (
              <tr
                key={b.id}
                className={`align-middle ${
                  expDeleted ? "bg-destructive/5 opacity-80" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <p
                    className={`font-medium text-foreground ${
                      expDeleted ? "line-through decoration-destructive/60" : ""
                    }`}
                  >
                    {touristName(b.touristId)}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <p
                      className={`${
                        expDeleted
                          ? "line-through decoration-destructive/60 text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {experienceTitle(b.experienceId)}
                    </p>
                    {expDeleted && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">
                        Expérience supprimée
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" /> {b.date.slice(0, 10)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <UsersIcon className="h-3.5 w-3.5" /> {b.guests}
                  </span>
                </td>
                <td
                  className={`px-4 py-3 font-semibold text-foreground ${
                    expDeleted ? "line-through decoration-destructive/60" : ""
                  }`}
                >
                  {b.totalPrice} MAD
                </td>
                <td className="px-4 py-3">
                  <select
                    className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
                    value={b.status}
                    onChange={(e) => updateStatus(b, e.target.value as BookingStatus)}
                    disabled={updateMutation.isPending}
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    <StatusBadge status={b.status} />
                    {!expDeleted && (
                      <IconBtn onClick={() => startEdit(b)} label="Modifier">
                        <Pencil className="h-4 w-4" />
                      </IconBtn>
                    )}
                    <IconBtn
                      onClick={() => remove(b.id)}
                      label="Supprimer"
                      danger
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconBtn>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={creating || !!editingId}
        title={editingId ? "Modifier la réservation" : "Nouvelle réservation"}
        onClose={() => {
          setCreating(false);
          setEditingId(null);
        }}
        onSave={save}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Touriste">
            <select
              className={fieldCls}
              value={draft.touristId}
              onChange={(e) => setDraft({ ...draft, touristId: e.target.value })}
            >
              <option value="">Sélectionner…</option>
              {users
                .filter((u) => u.role === "tourist")
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.email})
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Expérience">
            <select
              className={fieldCls}
              value={draft.experienceId}
              onChange={(e) => setDraft({ ...draft, experienceId: e.target.value })}
            >
              <option value="">Sélectionner…</option>
              {experiences.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date">
            <input
              type="date"
              className={fieldCls}
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            />
          </Field>
          <Field label="Statut">
            <select
              className={fieldCls}
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value as BookingStatus })}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prix total (MAD)">
            <input
              type="number"
              min={0}
              className={fieldCls}
              value={draft.totalPrice}
              onChange={(e) => setDraft({ ...draft, totalPrice: e.target.value })}
            />
          </Field>
          <Field label="Voyageurs">
            <input
              type="number"
              min={1}
              className={fieldCls}
              value={draft.guests}
              onChange={(e) => setDraft({ ...draft, guests: e.target.value })}
            />
          </Field>
        </div>
      </Modal>
    </section>
  );
}
