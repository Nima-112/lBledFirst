import { IconBtn, PanelHeader } from "@/components/dashboard/ui";
import { emptyFormation, formatDuration, Formation, totalCapsules } from "@/lib/formations";
import { useI18n } from "@/lib/i18n";
import {
  Clock,
  ExternalLink,
  GraduationCap,
  Link,
  Loader2,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FormationEditor } from "./FormationEditor";
import {
  createFormation,
  deleteFormation,
  getFormationForEditApi,
  getFormationsList,
  updateFormation,
} from "@/services/formations.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function FormationsPanel() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Formation | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Formation>(emptyFormation());
  const [loadDetailError, setLoadDetailError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: ["admin-formations"],
    queryFn: getFormationsList,
  });

  const createMutation = useMutation({
    mutationFn: createFormation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-formations"] });
      setCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: Formation }) => updateFormation(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-formations"] });
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFormation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-formations"] });
    },
  });

  const formations = listQuery.data ?? [];
  const busy =
    listQuery.isLoading ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;
  const anyError =
    validationError ??
    loadDetailError ??
    listQuery.error ??
    createMutation.error ??
    updateMutation.error ??
    deleteMutation.error;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return formations;
    return formations.filter(
      (f) =>
        f.title.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.instructor.name.toLowerCase().includes(q),
    );
  }, [formations, query]);

  const startCreate = useCallback(() => {
    setDraft(emptyFormation());
    setCreating(true);
  }, []);

  const startEdit = useCallback(async (f: Formation) => {
    setEditing(f);
    setDraft(emptyFormation());
    setLoadDetailError(null);
    try {
      // Admin-only endpoint: always returns real capsule videoUrls, unlike
      // the tourist-facing getFormationDetail which nulls them out unless
      // the requester has purchased the formation (admins never have).
      const full = await getFormationForEditApi(f.slug);
      setDraft(full);
    } catch (err: any) {
      setLoadDetailError(err?.message ?? "Impossible de charger la formation");
      setDraft(f);
    }
  }, []);

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const save = useCallback(async () => {
    setValidationError(null);
    if (!draft.title.trim()) return;
    if (!draft.shortDescription.trim()) {
      setValidationError("La description courte est obligatoire.");
      return;
    }
    if (!draft.longDescription.trim()) {
      setValidationError("La description longue est obligatoire.");
      return;
    }
    if (!draft.instructor?.name?.trim()) {
      setValidationError("Le nom du formateur est obligatoire.");
      return;
    }
    if (!draft.category?.trim()) {
      setValidationError("La catégorie est obligatoire.");
      return;
    }
    if (!draft.language?.trim()) {
      setValidationError("La langue est obligatoire.");
      return;
    }
    if (!draft.coverImage?.trim()) {
      setValidationError("L'image de couverture est obligatoire.");
      return;
    }
    const total = draft.chapters.reduce(
      (s, ch) => s + ch.capsules.reduce((cs, c) => cs + c.duration, 0),
      0,
    );
    const next: Formation = {
      ...draft,
      totalDuration: total || draft.totalDuration,
      slug: draft.slug || slugify(draft.title) || `formation-${Date.now()}`,
    };
    if (editing) {
      await updateMutation.mutateAsync({ slug: editing.slug, data: next });
    } else {
      const uniqueSlug = formations.some((f) => f.slug === next.slug)
        ? `${next.slug}-${Date.now()}`
        : next.slug;
      await createMutation.mutateAsync({ ...next, slug: uniqueSlug });
    }
  }, [draft, editing, formations, createMutation, updateMutation]);

  const remove = useCallback(
    (slug: string) => {
      if (confirm(t("admin.formations.confirmDelete"))) {
        deleteMutation.mutate(slug);
      }
    },
    [t, deleteMutation],
  );

  const closeEditor = useCallback(() => {
    setCreating(false);
    setEditing(null);
    setLoadDetailError(null);
    setValidationError(null);
  }, []);

  return (
    <section>
      <PanelHeader
        title={t("admin.formations.title")}
        subtitle={t("admin.formations.subtitle")}
        query={query}
        setQuery={setQuery}
        onAdd={startCreate}
        addLabel={t("admin.formations.add")}
      />

      {(busy || anyError) && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm">
          {listQuery.isLoading && (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Chargement des formations…</span>
            </>
          )}
          {(createMutation.isPending || updateMutation.isPending) && (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-foreground">Enregistrement en cours…</span>
            </>
          )}
          {deleteMutation.isPending && (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-destructive" />
              <span className="text-destructive">Suppression en cours…</span>
            </>
          )}
          {anyError && (
            <span className="text-destructive">
              {validationError ??
                loadDetailError ??
                (listQuery.error instanceof Error
                  ? listQuery.error.message
                  : ((createMutation.error as Error)?.message ??
                    (updateMutation.error as Error)?.message ??
                    (deleteMutation.error as Error)?.message ??
                    "Erreur inconnue"))}
            </span>
          )}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.length === 0 && !listQuery.isLoading && (
          <p className="col-span-full rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
            {t("admin.formations.empty")}
          </p>
        )}
        {filtered.map((f) => (
          <article
            key={f.slug}
            className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card"
          >
            <div className="relative aspect-video overflow-hidden">
              <img
                src={f.coverImage}
                alt={f.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
              <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-foreground backdrop-blur">
                  {f.category}
                </span>
                <span className="rounded-full bg-saffron/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink backdrop-blur">
                  {f.level}
                </span>
              </div>
              <span className="absolute bottom-3 right-3 rounded-full bg-primary/95 px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-warm">
                {f.price} MAD
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="font-display text-base font-bold leading-tight text-foreground">
                {f.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {f.shortDescription}
              </p>

              <div className="mt-3 flex items-center gap-2 border-t border-border/70 pt-3">
                {f.instructor.photo ? (
                  <img
                    src={f.instructor.photo}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-bold uppercase text-muted-foreground">
                    {(f.instructor.name || "F").slice(0, 2)}
                  </div>
                )}
                <span className="truncate text-xs font-semibold text-foreground">
                  {f.instructor.name || "Formateur non renseigné"}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10px] font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1">
                  <Clock className="h-3 w-3" /> {formatDuration(f.totalDuration || 0)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1">
                  <GraduationCap className="h-3 w-3" /> {totalCapsules(f)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1">
                  <Users className="h-3 w-3" /> {f.studentsCount}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-1.5 border-t border-border pt-3">
                <Link
                  to="/formations/$slug"
                  params={{ slug: f.slug }}
                  target="_blank"
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted"
                >
                  <ExternalLink className="h-3 w-3" /> {t("admin.formations.view")}
                </Link>
                <div className="flex items-center gap-1.5">
                  <IconBtn onClick={() => startEdit(f)} label={t("admin.formations.edit")}>
                    <Pencil className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn
                    onClick={() => remove(f.slug)}
                    label={t("admin.formations.delete")}
                    danger
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconBtn>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <FormationEditor
        open={creating || !!editing}
        title={editing ? t("admin.formations.editTitle") : t("admin.formations.createTitle")}
        draft={draft}
        setDraft={setDraft}
        onClose={closeEditor}
        onSave={save}
        saving={createMutation.isPending || updateMutation.isPending}
        loadDetailError={loadDetailError}
      />
    </section>
  );
}
