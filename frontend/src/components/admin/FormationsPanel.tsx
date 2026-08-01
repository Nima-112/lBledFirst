import { IconBtn, PanelHeader } from "@/components/dashboard/ui";
import { emptyFormation, formatDuration, Formation, totalCapsules } from "@/lib/formations";
import { useI18n } from "@/lib/i18n";
import { Clock, ExternalLink, GraduationCap, Link, Pencil, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { FormationEditor } from "./ExperiencesEditor";

export function FormationsPanel({
  formations,
  onChange,
}: {
  formations: Formation[];
  onChange: (f: Formation[]) => void;
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Formation | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Formation>(emptyFormation());

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

  const startCreate = () => {
    setDraft(emptyFormation());
    setCreating(true);
  };
  const startEdit = (f: Formation) => {
    setDraft(structuredClone(f));
    setEditing(f);
  };

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const save = () => {
    if (!draft.title.trim()) return;
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
      onChange(formations.map((f) => (f.slug === editing.slug ? next : f)));
      setEditing(null);
    } else {
      const uniqueSlug = formations.some((f) => f.slug === next.slug)
        ? `${next.slug}-${Date.now()}`
        : next.slug;
      onChange([...formations, { ...next, slug: uniqueSlug }]);
      setCreating(false);
    }
  };

  const remove = (slug: string) => {
    if (confirm(t("admin.formations.confirmDelete"))) {
      onChange(formations.filter((f) => f.slug !== slug));
    }
  };

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

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.length === 0 && (
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
                <img
                  src={f.instructor.photo}
                  alt=""
                  className="h-7 w-7 rounded-full object-cover"
                />
                <span className="truncate text-xs font-semibold text-foreground">
                  {f.instructor.name}
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
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSave={save}
      />
    </section>
  );
}