import { Field, fieldCls, IconBtn, Modal } from "@/components/dashboard/ui";
import { useI18n } from "@/lib/i18n";
import { Plus, Trash2, X as XIcon } from "lucide-react";
import {
  CATEGORIES as FORMATION_CATEGORIES,
  LEVELS,
  LANGUAGES as FORMATION_LANGUAGES,
  type Formation,
  type Chapter,
  type Capsule,
} from "@/lib/formations";

export function FormationEditor({
  open,
  title,
  draft,
  setDraft,
  onClose,
  onSave,
}: {
  open: boolean;
  title: string;
  draft: Formation;
  setDraft: (f: Formation) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const { t } = useI18n();
  const patch = (p: Partial<Formation>) => setDraft({ ...draft, ...p });
  const patchInstructor = (p: Partial<Formation["instructor"]>) =>
    setDraft({ ...draft, instructor: { ...draft.instructor, ...p } });

  const addChapter = () => {
    const order = draft.chapters.length + 1;
    setDraft({
      ...draft,
      chapters: [
        ...draft.chapters,
        {
          id: `ch-${Date.now()}`,
          order,
          title: `${t("admin.formations.chapter")} ${order}`,
          capsules: [],
        },
      ],
    });
  };
  const updateChapter = (i: number, patchCh: Partial<Chapter>) => {
    const next = draft.chapters.map((c, idx) => (idx === i ? { ...c, ...patchCh } : c));
    setDraft({ ...draft, chapters: next });
  };
  const removeChapter = (i: number) => {
    const next = draft.chapters
      .filter((_, idx) => idx !== i)
      .map((c, idx) => ({ ...c, order: idx + 1 }));
    setDraft({ ...draft, chapters: next });
  };
  const addCapsule = (chIdx: number) => {
    const ch = draft.chapters[chIdx];
    const order = ch.capsules.length + 1;
    updateChapter(chIdx, {
      capsules: [
        ...ch.capsules,
        {
          id: `c-${Date.now()}-${order}`,
          order,
          title: `${t("admin.formations.capsule")} ${order}`,
          description: "",
          duration: 10,
          thumbnail: ch.capsules[0]?.thumbnail ?? draft.coverImage,
        },
      ],
    });
  };
  const updateCapsule = (chIdx: number, capIdx: number, p: Partial<Capsule>) => {
    const ch = draft.chapters[chIdx];
    const next = ch.capsules.map((c, i) => (i === capIdx ? { ...c, ...p } : c));
    updateChapter(chIdx, { capsules: next });
  };
  const removeCapsule = (chIdx: number, capIdx: number) => {
    const ch = draft.chapters[chIdx];
    const next = ch.capsules.filter((_, i) => i !== capIdx).map((c, i) => ({ ...c, order: i + 1 }));
    updateChapter(chIdx, { capsules: next });
  };

  const listField = (
    label: string,
    values: string[],
    key: "objectives" | "skills" | "prerequisites",
  ) => (
    <Field label={label}>
      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className={fieldCls}
              value={v}
              onChange={(e) => {
                const next = [...values];
                next[i] = e.target.value;
                patch({ [key]: next } as Partial<Formation>);
              }}
            />
            <IconBtn
              onClick={() =>
                patch({ [key]: values.filter((_, idx) => idx !== i) } as Partial<Formation>)
              }
              label="—"
              danger
            >
              <XIcon className="h-4 w-4" />
            </IconBtn>
          </div>
        ))}
        <button
          type="button"
          onClick={() => patch({ [key]: [...values, ""] } as Partial<Formation>)}
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted"
        >
          <Plus className="h-3.5 w-3.5" /> {t("admin.formations.addItem")}
        </button>
      </div>
    </Field>
  );

  return (
    <Modal open={open} title={title} onClose={onClose} onSave={onSave}>
      <div className="space-y-5">
        {/* Core info */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("admin.formations.f.title")}>
            <input
              className={fieldCls}
              value={draft.title}
              onChange={(e) => patch({ title: e.target.value })}
            />
          </Field>
          <Field label={t("admin.formations.f.slug")}>
            <input
              className={fieldCls}
              value={draft.slug}
              onChange={(e) => patch({ slug: e.target.value })}
            />
          </Field>
        </div>
        <Field label={t("admin.formations.f.short")}>
          <textarea
            rows={2}
            className={fieldCls}
            value={draft.shortDescription}
            onChange={(e) => patch({ shortDescription: e.target.value })}
          />
        </Field>
        <Field label={t("admin.formations.f.long")}>
          <textarea
            rows={4}
            className={fieldCls}
            value={draft.longDescription}
            onChange={(e) => patch({ longDescription: e.target.value })}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t("admin.formations.f.category")}>
            <select
              className={fieldCls}
              value={draft.category}
              onChange={(e) => patch({ category: e.target.value })}
            >
              {[
                ...FORMATION_CATEGORIES,
                "Broderie",
                "Zellige",
                "Tissage",
                "Poterie",
                "Calligraphie",
                "Cuisine",
                "Cuir",
                "Couture",
              ]
                .filter((v, i, a) => a.indexOf(v) === i)
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
          </Field>
          <Field label={t("admin.formations.f.level")}>
            <select
              className={fieldCls}
              value={draft.level}
              onChange={(e) => patch({ level: e.target.value as Formation["level"] })}
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("admin.formations.f.language")}>
            <select
              className={fieldCls}
              value={draft.language}
              onChange={(e) => patch({ language: e.target.value as Formation["language"] })}
            >
              {FORMATION_LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t("admin.formations.f.price")}>
            <input
              type="number"
              className={fieldCls}
              value={draft.price}
              onChange={(e) => patch({ price: Number(e.target.value) })}
            />
          </Field>
          <Field label={t("admin.formations.f.students")}>
            <input
              type="number"
              className={fieldCls}
              value={draft.studentsCount}
              onChange={(e) => patch({ studentsCount: Number(e.target.value) })}
            />
          </Field>
          <Field label={t("admin.formations.f.rating")}>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              className={fieldCls}
              value={draft.averageRating}
              onChange={(e) => patch({ averageRating: Number(e.target.value) })}
            />
          </Field>
        </div>

        <Field label={t("admin.formations.f.cover")}>
          <input
            className={fieldCls}
            value={draft.coverImage}
            onChange={(e) => patch({ coverImage: e.target.value })}
          />
        </Field>

        {/* Lists */}
        {listField(t("admin.formations.f.objectives"), draft.objectives, "objectives")}
        {listField(t("admin.formations.f.skills"), draft.skills, "skills")}
        {listField(t("admin.formations.f.prerequisites"), draft.prerequisites, "prerequisites")}

        {/* Instructor */}
        <div className="rounded-2xl border border-border bg-muted/40 p-4">
          <p className="mb-3 font-display text-sm font-bold text-foreground">
            {t("admin.formations.f.instructor")}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("admin.formations.f.iName")}>
              <input
                className={fieldCls}
                value={draft.instructor.name}
                onChange={(e) => patchInstructor({ name: e.target.value })}
              />
            </Field>
            <Field label={t("admin.formations.f.iSpecialty")}>
              <input
                className={fieldCls}
                value={draft.instructor.specialty}
                onChange={(e) => patchInstructor({ specialty: e.target.value })}
              />
            </Field>
            <Field label={t("admin.formations.f.iYears")}>
              <input
                type="number"
                className={fieldCls}
                value={draft.instructor.experienceYears}
                onChange={(e) => patchInstructor({ experienceYears: Number(e.target.value) })}
              />
            </Field>
            <Field label={t("admin.formations.f.iPhoto")}>
              <input
                className={fieldCls}
                value={draft.instructor.photo}
                onChange={(e) => patchInstructor({ photo: e.target.value })}
              />
            </Field>
          </div>
          <Field label={t("admin.formations.f.iBio")}>
            <textarea
              rows={2}
              className={fieldCls}
              value={draft.instructor.bio}
              onChange={(e) => patchInstructor({ bio: e.target.value })}
            />
          </Field>
        </div>

        {/* Chapters + capsules */}
        <div className="rounded-2xl border border-border bg-muted/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-sm font-bold text-foreground">
              {t("admin.formations.f.chapters")}
            </p>
            <button
              type="button"
              onClick={addChapter}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/20"
            >
              <Plus className="h-3.5 w-3.5" /> {t("admin.formations.f.addChapter")}
            </button>
          </div>

          <div className="space-y-3">
            {draft.chapters.length === 0 && (
              <p className="rounded-xl border border-dashed border-border bg-background px-3 py-4 text-center text-xs text-muted-foreground">
                {t("admin.formations.f.noChapters")}
              </p>
            )}
            {draft.chapters.map((ch, i) => (
              <div key={ch.id} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {ch.order}
                  </span>
                  <input
                    className={fieldCls}
                    value={ch.title}
                    onChange={(e) => updateChapter(i, { title: e.target.value })}
                    placeholder={t("admin.formations.chapter")}
                  />
                  <IconBtn onClick={() => removeChapter(i)} label="—" danger>
                    <Trash2 className="h-4 w-4" />
                  </IconBtn>
                </div>
                <div className="mt-3 space-y-2 ps-9">
                  {ch.capsules.map((c, j) => (
                    <div
                      key={c.id}
                      className="grid gap-2 rounded-lg bg-muted/50 p-2 sm:grid-cols-[auto_1fr_90px_auto]"
                    >
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-background text-[11px] font-bold text-foreground">
                        {c.order}
                      </span>
                      <input
                        className={fieldCls}
                        value={c.title}
                        onChange={(e) => updateCapsule(i, j, { title: e.target.value })}
                        placeholder={t("admin.formations.capsule")}
                      />
                      <input
                        type="number"
                        className={fieldCls}
                        value={c.duration}
                        onChange={(e) => updateCapsule(i, j, { duration: Number(e.target.value) })}
                        placeholder="min"
                      />
                      <IconBtn onClick={() => removeCapsule(i, j)} label="—" danger>
                        <Trash2 className="h-4 w-4" />
                      </IconBtn>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addCapsule(i)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:bg-muted"
                  >
                    <Plus className="h-3 w-3" /> {t("admin.formations.f.addCapsule")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
