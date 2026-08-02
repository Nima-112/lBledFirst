import { Field, fieldCls, IconBtn, Modal, PanelHeader } from "@/components/dashboard/ui";
import { Mail, MapPin, Pencil, Phone, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUser,
  deleteUser,
  FrontUser,
  getUsersList,
  updateUser,
} from "@/services/users.service";

type DraftUser = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  nativeLanguage: string;
};

const EMPTY: DraftUser = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  country: "",
  nativeLanguage: "",
};

export function TouristsPanel() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<DraftUser>(EMPTY);

  const listQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: getUsersList,
  });

  const createMutation = useMutation({
    mutationFn: (u: FrontUser) => createUser(u),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FrontUser }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const users = listQuery.data ?? [];
  const tourists = useMemo(
    () => users.filter((u) => u.role === "tourist"),
    [users],
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tourists;
    return tourists.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.country ?? "").toLowerCase().includes(q),
    );
  }, [tourists, query]);

  const startCreate = () => {
    setDraft(EMPTY);
    setCreating(true);
  };
  const startEdit = (u: FrontUser) => {
    setDraft({
      fullName: u.fullName,
      email: u.email,
      password: "",
      phone: u.phone ?? "",
      country: u.country,
      nativeLanguage: u.nativeLanguage,
    });
    setEditingId(u.id);
  };

  const save = async () => {
    if (!draft.fullName || !draft.email) return;
    if (editingId) {
      const existing = users.find((u) => u.id === editingId)!;
      await updateMutation.mutateAsync({
        id: editingId,
        data: { ...existing, ...draft, role: "tourist" },
      });
    } else {
      const newUser: FrontUser = {
        id: "",
        ...draft,
        role: "tourist",
        createdAt: new Date().toISOString(),
      };
      await createMutation.mutateAsync(newUser);
    }
  };

  const remove = (id: string) => {
    if (confirm("Supprimer ce touriste ?")) deleteMutation.mutate(id);
  };

  const busy = listQuery.isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <section>
      <PanelHeader
        title="Touristes"
        subtitle="Consultez et gérez les utilisateurs inscrits sur la plateforme."
        query={query}
        setQuery={setQuery}
        onAdd={startCreate}
        addLabel="Nouveau touriste"
      />

      {busy && (
        <p className="mb-4 text-sm text-muted-foreground">Chargement…</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.length === 0 && !listQuery.isLoading && (
          <p className="col-span-full rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
            Aucun touriste.
          </p>
        )}
        {filtered.map((u) => (
          <article key={u.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-start justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display font-bold text-primary">
                  {u.fullName.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{u.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.country || "—"}</p>
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {u.email}
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {u.phone || "—"}
              </p>
              <p className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {u.nativeLanguage || "—"}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 border-t border-border pt-3">
              <IconBtn onClick={() => startEdit(u)} label="Modifier">
                <Pencil className="h-4 w-4" />
              </IconBtn>
              <IconBtn onClick={() => remove(u.id)} label="Supprimer" danger disabled={deleteMutation.isPending}>
                <Trash2 className="h-4 w-4" />
              </IconBtn>
            </div>
          </article>
        ))}
      </div>

      <Modal
        open={creating || !!editingId}
        title={editingId ? "Modifier le touriste" : "Nouveau touriste"}
        onClose={() => {
          setCreating(false);
          setEditingId(null);
        }}
        onSave={save}
      >
        <Field label="Nom complet">
          <input
            className={fieldCls}
            value={draft.fullName}
            onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="E-mail">
            <input
              className={fieldCls}
              type="email"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            />
          </Field>
          <Field label="Téléphone">
            <input
              className={fieldCls}
              value={draft.phone}
              onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Pays d'origine">
            <input
              className={fieldCls}
              value={draft.country}
              onChange={(e) => setDraft({ ...draft, country: e.target.value })}
            />
          </Field>
          <Field label="Langue maternelle">
            <input
              className={fieldCls}
              value={draft.nativeLanguage}
              onChange={(e) => setDraft({ ...draft, nativeLanguage: e.target.value })}
            />
          </Field>
        </div>
        <Field label={editingId ? "Nouveau mot de passe (laisser vide pour inchangé)" : "Mot de passe"}>
          <input
            className={fieldCls}
            type="text"
            value={draft.password}
            onChange={(e) => setDraft({ ...draft, password: e.target.value })}
          />
        </Field>
      </Modal>
    </section>
  );
}
