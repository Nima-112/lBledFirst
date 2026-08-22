import {
  CalendarRange,
  Clock,
  Heart,
  MapPin,
  Pencil,
  Plus,
  Star,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { resolveUploadUrl } from "@/lib/asset-url";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Field,
  fieldCls,
  IconBtn,
  Modal,
  PanelHeader,
  StatusBadge,
} from "@/components/dashboard/ui";
import {
  createExperience,
  deleteExperience,
  DayProgram,
  FrontExperience,
  getExperiencesList,
  publishExperience,
  updateExperience,
  uploadImage,
} from "@/services/experiences.service";
import { getUsersList } from "@/services/users.service";
import { getRegionsList } from "@/services/regions.service";
import { FormErrorBanner } from "@/components/ui/form-feedback";
import { parseApiError } from "@/lib/api-errors";
import { toast } from "sonner";

const EXPERIENCE_CATEGORIES = [
  "Hiking",
  "Cuisine",
  "Crafts",
  "Homestays",
  "Culture",
  "Atelier",
  "Nature",
  "Visite",
  "Détente",
];

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1545893835-abaa50cbe628?auto=format&fit=crop&w=800&q=80";

type DraftExperience = {
  title: string;
  description: string;
  hostId: string;
  price: string;
  durationDays: string;
  region: string;
  regionId: string;
  category: string;
  images: string[];
  program: DayProgram[];
  status: "draft" | "published" | "archived";
};

const emptyProgram = (day = 1): DayProgram => ({
  day,
  title: `Jour ${day}`,
  description: "",
  images: [],
});

const EMPTY: DraftExperience = {
  title: "",
  description: "",
  hostId: "",
  price: "",
  durationDays: "1",
  region: "",
  regionId: "",
  category: EXPERIENCE_CATEGORIES[0] ?? "Culture",
  images: [],
  program: [emptyProgram(1)],
  status: "draft",
};

export function ExperiencesPanel() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<DraftExperience>(EMPTY);
  const [saveError, setSaveError] = useState<string | null>(null);

  const expQuery = useQuery({
    queryKey: ["admin-experiences"],
    queryFn: getExperiencesList,
  });
  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: getUsersList,
  });
  const regionsQuery = useQuery({
    queryKey: ["admin-regions"],
    queryFn: getRegionsList,
  });

  const createMutation = useMutation({
    mutationFn: (e: FrontExperience) => createExperience(e),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-experiences"] });
      setCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FrontExperience }) =>
      updateExperience(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-experiences"] });
      setEditingId(null);
    },
  });

  const publishMutation = useMutation({
    mutationFn: publishExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-experiences"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-experiences"] });
    },
  });

  const experiences = expQuery.data ?? [];
  const users = usersQuery.data ?? [];
  const regions = regionsQuery.data ?? [];

  const ownerName = (id: string) =>
    users.find((u) => u.id === id)?.fullName ?? `Auteur #${id}`;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return experiences;
    return experiences.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.region ?? "").toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q),
    );
  }, [experiences, query]);

  const startCreate = () => {
    const authors = users.filter((u) => u.role === "host" || u.role === "formateur");
    setDraft({ ...EMPTY, hostId: authors[0]?.id ?? "" });
    setCreating(true);
  };
  const startEdit = (e: FrontExperience) => {
    setDraft({
      title: e.title,
      description: e.description,
      hostId: e.hostId,
      price: String(e.price),
      durationDays: String(e.durationDays),
      region: e.region,
      regionId: e.regionId,
      category: e.category,
      images: [...e.images],
      program: e.program.length
        ? e.program.map((p) => ({
            day: p.day,
            title: p.title,
            description: p.description,
            images: [...(p.images ?? [])],
          }))
        : [emptyProgram(1)],
      status: e.status,
    });
    setEditingId(e.id);
  };

  const togglePublish = (e: FrontExperience) => {
    if (e.status === "published") {
      updateMutation.mutate({
        id: e.id,
        data: { ...e, status: "draft" },
      });
    } else {
      publishMutation.mutate(e.id);
    }
  };

  const addImage = () => {
    setDraft({ ...draft, images: [...draft.images, ""] });
  };

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file);
      setDraft({ ...draft, images: [...draft.images, url] });
    } catch {
      alert("Erreur lors de l'upload de l'image");
    }
    e.target.value = "";
  };

  const handleProgramFileUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file);
      updateProgram(idx, { images: [...(draft.program[idx].images ?? []), url] });
    } catch {
      alert("Erreur lors de l'upload de l'image");
    }
    e.target.value = "";
  };
  const setImage = (i: number, v: string) => {
    const next = [...draft.images];
    next[i] = v;
    setDraft({ ...draft, images: next });
  };
  const removeImage = (i: number) => {
    const next = draft.images.filter((_, k) => k !== i);
    setDraft({ ...draft, images: next });
  };

  const addProgram = () => {
    setDraft({
      ...draft,
      program: [...draft.program, emptyProgram(draft.program.length + 1)],
    });
  };
  const updateProgram = (i: number, patch: Partial<DayProgram>) => {
    const next = [...draft.program];
    next[i] = { ...next[i], ...patch };
    setDraft({ ...draft, program: next });
  };
  const removeProgram = (i: number) => {
    const newProgram = draft.program
      .filter((_, k) => k !== i)
      .map((p, idx) => ({ ...p, day: idx + 1 }));
    const newDuration = String(newProgram.length || 1);
    setDraft({ ...draft, program: newProgram, durationDays: newDuration });
  };
  const addProgramImage = (idx: number) => {
    updateProgram(idx, {
      images: [...(draft.program[idx].images ?? []), ""],
    });
  };
  const setProgramImage = (idx: number, i: number, v: string) => {
    const next = [...(draft.program[idx].images ?? [])];
    next[i] = v;
    updateProgram(idx, { images: next });
  };
  const removeProgramImage = (idx: number, i: number) => {
    updateProgram(idx, {
      images: draft.program[idx].images.filter((_, k) => k !== i),
    });
  };

  const save = async () => {
    setSaveError(null);
    if (!draft.title || !draft.hostId) {
      setSaveError("Le titre et l'auteur (hôte) sont obligatoires.");
      return;
    }
    const payload: FrontExperience = {
      id: editingId ?? "",
      title: draft.title,
      description: draft.description,
      hostId: draft.hostId,
      price: Number(draft.price) || 0,
      durationDays: Number(draft.durationDays) || 1,
      region: draft.region,
      regionId: draft.regionId,
      category: draft.category,
      latitude: 0,
      longitude: 0,
      images: draft.images,
      program: draft.program,
      status: draft.status,
      createdAt: new Date().toISOString(),
    };
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
        toast.success("Expérience mise à jour.");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Expérience créée.");
      }
    } catch (err) {
      setSaveError(parseApiError(err, "Impossible d'enregistrer l'expérience.").message);
    }
  };

  const remove = (id: string) => {
    if (confirm("Supprimer cette expérience ?")) deleteMutation.mutate(id);
  };

  const busy =
    expQuery.isLoading ||
    usersQuery.isLoading ||
    regionsQuery.isLoading ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    publishMutation.isPending;

  const authors = users.filter((u) => u.role === "host" || u.role === "formateur");

  return (
    <section>
      <PanelHeader
        title="Expériences"
        subtitle="Gérez les expériences et leur publication."
        query={query}
        setQuery={setQuery}
        onAdd={startCreate}
        addLabel="Nouvelle expérience"
      />

      {busy && (
        <p className="mb-4 text-sm text-muted-foreground">Chargement…</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.length === 0 && !expQuery.isLoading && (
          <p className="col-span-full rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
            Aucune expérience.
          </p>
        )}
        {filtered.map((e) => {
          const cover = resolveUploadUrl(e.images?.[0]) ?? DEFAULT_IMAGE;
          return (
            <article
              key={e.id}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
            >
              <div className="relative">
                <img
                  src={cover}
                  alt={e.title}
                  className="aspect-[16/10] w-full object-cover"
                />
                <div className="absolute left-3 top-3 flex items-center gap-1.5">
                  <StatusBadge status={e.status} />
                </div>
                <div className="absolute right-3 top-3">
                  <button
                    onClick={() => togglePublish(e)}
                    disabled={updateMutation.isPending || publishMutation.isPending}
                    className={
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm transition " +
                      (e.status === "published"
                        ? "bg-white/90 text-foreground hover:bg-white"
                        : "bg-primary text-primary-foreground hover:bg-primary/90")
                    }
                  >
                    {e.status === "published" ? "Dépublier" : "Publier"}
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="truncate font-semibold text-foreground">{e.title}</h4>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {ownerName(e.hostId)}
                    </p>
                  </div>
                  <p className="whitespace-nowrap font-display font-bold text-primary">
                    {e.price} MAD
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {e.region || "—"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarRange className="h-3.5 w-3.5" /> {e.durationDays} j
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {e.category}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] font-semibold text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1">
                    <Clock className="h-3 w-3" /> {e.durationDays} j
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1">
                    <Users className="h-3 w-3" /> {e.bookingsCount ?? 0}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1">
                    <Heart className="h-3 w-3" /> {e.favoritesCount ?? 0}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1">
                    <Star className="h-3 w-3 text-saffron" />
                    {(e.averageRating ?? 0).toFixed(1)}
                    {e.reviewsCount ? (
                      <span className="text-muted-foreground/70">({e.reviewsCount})</span>
                    ) : null}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-1.5 border-t border-border pt-3">
                  <IconBtn onClick={() => startEdit(e)} label="Modifier">
                    <Pencil className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn
                    onClick={() => remove(e.id)}
                    label="Supprimer"
                    danger
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconBtn>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <Modal
        open={creating || !!editingId}
        title={editingId ? "Modifier l'expérience" : "Nouvelle expérience"}
        size="xl"
        onClose={() => {
          setCreating(false);
          setEditingId(null);
        }}
        onSave={save}
      >
        <FormErrorBanner message={saveError} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Titre">
            <input
              className={fieldCls}
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </Field>
          <Field label="Auteur">
            <select
              className={fieldCls}
              value={draft.hostId}
              onChange={(e) => setDraft({ ...draft, hostId: e.target.value })}
            >
              <option value="">Sélectionner…</option>
              {authors.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.fullName} ({h.email})
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Description">
          <textarea
            className={fieldCls}
            rows={3}
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Prix (MAD)">
            <input
              type="number"
              min={0}
              className={fieldCls}
              value={draft.price}
              onChange={(e) => setDraft({ ...draft, price: e.target.value })}
            />
          </Field>
          <Field label="Durée (jours)">
            <input
              type="number"
              min={1}
              className={fieldCls}
              value={draft.durationDays}
              onChange={(e) => {
                const newDuration = Math.max(1, Number(e.target.value) || 1);
                const currentProgram = [...draft.program];
                let newProgram: DayProgram[];
                if (newDuration > currentProgram.length) {
                  // Add empty days
                  newProgram = [...currentProgram];
                  for (let d = currentProgram.length + 1; d <= newDuration; d++) {
                    newProgram.push(emptyProgram(d));
                  }
                } else if (newDuration < currentProgram.length) {
                  // Truncate extra days
                  newProgram = currentProgram.slice(0, newDuration);
                } else {
                  newProgram = currentProgram;
                }
                setDraft({ ...draft, durationDays: e.target.value, program: newProgram });
              }}
            />
          </Field>
          <Field label="Catégorie">
            <select
              className={fieldCls}
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            >
              {EXPERIENCE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Région">
            <select
              className={fieldCls}
              value={draft.regionId}
              onChange={(e) => setDraft({ ...draft, regionId: e.target.value })}
            >
              <option value="">Sélectionner…</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name.fr}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ville">
            <input
              className={fieldCls}
              value={draft.region}
              onChange={(e) => setDraft({ ...draft, region: e.target.value })}
            />
          </Field>
        </div>

        <Field label="Images de couverture">
          <div className="grid gap-3 sm:grid-cols-3">
            {draft.images.map((img, i) => (
              <div key={i} className="relative">
                <img
                  src={resolveUploadUrl(img) || img}
                  alt=""
                  className="aspect-video w-full rounded-xl border border-border object-cover"
                />
                <IconBtn
                  onClick={() => removeImage(i)}
                  label="Retirer"
                  danger
                  className="absolute right-1.5 top-1.5"
                >
                  <X className="h-3.5 w-3.5" />
                </IconBtn>
                <input
                  className="mt-1 w-full rounded-lg border border-border px-2 py-1 text-[11px]"
                  value={img}
                  onChange={(e) => setImage(i, e.target.value)}
                />
              </div>
            ))}
            <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border text-xs font-medium text-muted-foreground hover:text-foreground">
              <Upload className="mb-1 h-4 w-4" /> Ajouter une image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverFileUpload}
              />
            </label>
          </div>
        </Field>
        <Field label="Programme par jour">
          <div className="space-y-4">
            {draft.program.map((p, idx) => (
              <div key={idx} className="rounded-xl border border-border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">
                    Jour {idx + 1}
                  </span>
                  {draft.program.length > 1 && (
                    <IconBtn onClick={() => removeProgram(idx)} label="Retirer" danger>
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconBtn>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Titre">
                    <input
                      className={fieldCls}
                      value={p.title}
                      onChange={(e) => updateProgram(idx, { title: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label="Description">
                  <textarea
                    className={fieldCls}
                    rows={2}
                    value={p.description}
                    onChange={(e) => updateProgram(idx, { description: e.target.value })}
                  />
                </Field>
                <div className="mt-3">
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                    Images du jour
                  </p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {(p.images ?? []).map((img, i) => (
                      <div key={i} className="relative">
                        <img
                          src={resolveUploadUrl(img) || img}
                          alt=""
                          className="aspect-square w-full rounded-lg border border-border object-cover"
                        />
                        <IconBtn
                          onClick={() => removeProgramImage(idx, i)}
                          label="Retirer"
                          danger
                          className="absolute right-1 top-1"
                        >
                          <X className="h-3 w-3" />
                        </IconBtn>
                        <input
                          className="mt-1 w-full rounded-lg border border-border px-2 py-1 text-[10px]"
                          value={img}
                          onChange={(e) => setProgramImage(idx, i, e.target.value)}
                        />
                      </div>
                    ))}
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-[10px] font-medium text-muted-foreground hover:text-foreground">
                      <Plus className="h-3.5 w-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleProgramFileUpload(idx, e)}
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
            {draft.program.length < (Number(draft.durationDays) || 1) && (
              <button
                onClick={addProgram}
                className="w-full rounded-xl border-2 border-dashed border-border py-3 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                + Ajouter un jour ({draft.program.length}/{draft.durationDays})
              </button>
            )}
            {draft.program.length >= (Number(draft.durationDays) || 1) && (
              <p className="text-center text-xs text-muted-foreground py-2">
                Programme complet ({draft.program.length}/{draft.durationDays} jours)
              </p>
            )}
          </div>
        </Field>
        <Field label="Statut">
          <select
            className={fieldCls}
            value={draft.status}
            onChange={(e) => setDraft({ ...draft, status: e.target.value as DraftExperience["status"] })}
          >
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
            <option value="archived">Archivé</option>
          </select>
        </Field>
      </Modal>
    </section>
  );
}
