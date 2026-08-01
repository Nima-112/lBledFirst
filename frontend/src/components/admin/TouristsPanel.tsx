import { Field, fieldCls, IconBtn, Modal, PanelHeader } from "@/components/dashboard/ui";
import { MockUser } from "@/lib/mock-auth";
import { Role } from "@/types/auth";
import { Mail, MapPin, Pencil, Phone, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

const EMPTY_TOURIST = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  country: "",
  nativeLanguage: "",
  role: "tourist" as Role,
};

export function TouristsPanel({
  users,
  onChange,
}: {
  users: MockUser[];
  onChange: (u: MockUser[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<MockUser | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(EMPTY_TOURIST);

  const tourists = useMemo(() => users.filter((u) => u.role === "tourist"), [users]);
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
    setDraft(EMPTY_TOURIST);
    setCreating(true);
  };
  const startEdit = (u: MockUser) => {
    setDraft({
      fullName: u.fullName,
      email: u.email,
      password: u.password,
      phone: u.phone ?? "",
      country: u.country,
      nativeLanguage: u.nativeLanguage,
      role: "tourist",
    });
    setEditing(u);
  };

  const save = () => {
    if (!draft.fullName || !draft.email) return;
    if (editing) {
      onChange(users.map((u) => (u.id === editing.id ? { ...u, ...draft, role: "tourist" } : u)));
      setEditing(null);
    } else {
      onChange([
        ...users,
        {
          ...draft,
          role: "tourist",
          id: `u-${Date.now()}`,
          password: draft.password || "tourist123",
          createdAt: new Date().toISOString(),
        },
      ]);
      setCreating(false);
    }
  };

  const remove = (id: string) => {
    if (confirm("Supprimer ce touriste ?")) onChange(users.filter((u) => u.id !== id));
  };

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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.length === 0 && (
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
              <IconBtn onClick={() => remove(u.id)} label="Supprimer" danger>
                <Trash2 className="h-4 w-4" />
              </IconBtn>
            </div>
          </article>
        ))}
      </div>

      <Modal
        open={creating || !!editing}
        title={editing ? "Modifier le touriste" : "Nouveau touriste"}
        onClose={() => {
          setCreating(false);
          setEditing(null);
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
        <Field label="Mot de passe">
          <input
            className={fieldCls}
            value={draft.password}
            onChange={(e) => setDraft({ ...draft, password: e.target.value })}
          />
        </Field>
      </Modal>
    </section>
  );
}