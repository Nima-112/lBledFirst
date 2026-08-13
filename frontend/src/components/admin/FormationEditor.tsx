import { Field, fieldCls, IconBtn, Modal } from "@/components/dashboard/ui";
import { useI18n } from "@/lib/i18n";
import {
  AlertTriangle,
  CheckCircle2,
  Link as LinkIcon,
  Loader2,
  Play,
  Plus,
  Trash2,
  Upload,
  X as XIcon,
  Youtube,
} from "lucide-react";
import {
  CATEGORIES as FORMATION_CATEGORIES,
  LEVELS,
  LANGUAGES as FORMATION_LANGUAGES,
  type Formation,
  type Chapter,
  type Capsule,
} from "@/lib/formations";
import { uploadVideo } from "@/services/formations.service";
import { uploadImage } from "@/services/experiences.service";
import type { FrontUser } from "@/services/users.service";
import { useMemo, useState } from "react";

type VideoMode = "url" | "upload";

export function FormationEditor({
  open,
  title,
  draft,
  setDraft,
  onClose,
  onSave,
  saving,
  loadDetailError,
  formateurs = [],
}: {
  open: boolean;
  title: string;
  draft: Formation;
  setDraft: (f: Formation) => void;
  onClose: () => void;
  onSave: () => void | Promise<void>;
  saving?: boolean;
  loadDetailError?: string | null;
  formateurs?: FrontUser[];
}) {
  const { t } = useI18n();
  const patch = (p: Partial<Formation>) => setDraft({ ...draft, ...p });

  const capKey = (i: number, j: number) => `${i}-${j}`;
  const [videoMode, setVideoMode] = useState<Record<string, VideoMode>>({});
  const capMode = (i: number, j: number): VideoMode =>
    videoMode[capKey(i, j)] ??
    (draft.chapters[i]?.capsules[j]?.videoUrl?.startsWith("http") ? "url" : "url");
  const setCapMode = (i: number, j: number, m: VideoMode) =>
    setVideoMode((prev) => ({ ...prev, [capKey(i, j)]: m }));

  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadErr, setUploadErr] = useState<Record<string, string>>({});
  const [uploadOk, setUploadOk] = useState<Record<string, boolean>>({});

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
          thumbnail: ch.capsules[ch.capsules.length - 1]?.thumbnail ?? draft.coverImage ?? "",
          videoUrl: undefined,
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

  const startUpload = async (chIdx: number, capIdx: number, file: File) => {
    const k = capKey(chIdx, capIdx);
    setUploading((p) => ({ ...p, [k]: true }));
    setUploadErr((p) => ({ ...p, [k]: "" }));
    setUploadOk((p) => ({ ...p, [k]: false }));
    try {
      const result = await uploadVideo(file);
      updateCapsule(chIdx, capIdx, {
        videoUrl: result.url,
        // Only overwrite duration if ffprobe actually returned one — if it
        // failed server-side, keep whatever the admin already had entered.
        ...(result.durationMinutes ? { duration: result.durationMinutes } : {}),
      });
      setUploadOk((p) => ({ ...p, [k]: true }));
      setTimeout(() => setUploadOk((p) => ({ ...p, [k]: false })), 3500);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Échec de l'upload vidéo";
      setUploadErr((p) => ({ ...p, [k]: String(msg) }));
    } finally {
      setUploading((p) => ({ ...p, [k]: false }));
    }
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

  const urlLooksHttps = (u: string) => /^https:\/\//i.test(u.trim());

  const totalCapsulesCount = useMemo(
    () => draft.chapters.reduce((s, ch) => s + ch.capsules.length, 0),
    [draft.chapters],
  );

  return (
    <Modal
      open={open}
      title={title}
      size="3xl"
      onClose={onClose}
      onSave={
        onSave && !saving
          ? () => {
              void Promise.resolve(onSave());
            }
          : undefined
      }
    >
      {loadDetailError && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Impossible de charger les chapitres et capsules</p>
            <p className="mt-0.5 opacity-90">{loadDetailError}</p>
            <p className="mt-1 opacity-80">
              Les modifications écraseront les champs non chargés. Fermez et réessayez.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("admin.formations.f.title")}>
            <input
              className={fieldCls}
              value={draft.title}
              onChange={(e) => patch({ title: e.target.value })}
              placeholder="Ma formation artisanale"
            />
          </Field>
          <Field label={t("admin.formations.f.slug")}>
            <input
              className={fieldCls}
              value={draft.slug}
              onChange={(e) => patch({ slug: e.target.value })}
              placeholder="ma-formation-tarz"
            />
          </Field>
        </div>
        <Field label={t("admin.formations.f.short")}>
          <textarea
            rows={2}
            className={fieldCls}
            value={draft.shortDescription}
            onChange={(e) => patch({ shortDescription: e.target.value })}
            placeholder="Une phrase d'accroche…"
          />
        </Field>
        <Field label={t("admin.formations.f.long")}>
          <textarea
            rows={6}
            className={fieldCls}
            value={draft.longDescription}
            onChange={(e) => patch({ longDescription: e.target.value })}
            placeholder="Description détaillée de la formation…"
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
                "Bijoux",
                "Menuiserie",
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
            <div className="relative">
              <input
                type="number"
                min={0}
                className={`${fieldCls} pe-10`}
                value={draft.price}
                onChange={(e) => patch({ price: Number(e.target.value) })}
              />
              <span className="absolute inset-y-0 end-3 inline-flex items-center text-xs font-semibold text-muted-foreground">
                MAD
              </span>
            </div>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
          <Field label={t("admin.formations.f.cover")}>
            <div className="flex gap-2">
              <input
                className={fieldCls}
                value={draft.coverImage}
                onChange={(e) => patch({ coverImage: e.target.value })}
                placeholder="https://… /images/cover.jpg"
              />
              <label className="flex cursor-pointer items-center justify-center rounded-xl border border-border bg-muted px-4 text-xs font-semibold hover:bg-muted/80">
                <Upload className="mr-2 h-4 w-4" /> Uploader
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const url = await uploadImage(file);
                      patch({ coverImage: url });
                    } catch {
                      alert("Erreur upload");
                    }
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            {draft.coverImage && (
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Image liée (clic externe pour
                vérifier)
              </p>
            )}
          </Field>
          {draft.coverImage && (
            <Field label="Aperçu">
              <div className="aspect-video overflow-hidden rounded-xl border border-border bg-muted">
                <img src={draft.coverImage} alt="" className="h-full w-full object-cover" />
              </div>
            </Field>
          )}
        </div>

        <Field label="Vidéo d'aperçu (optionnelle)">
          <input
            className={fieldCls}
            value={draft.previewVideo ?? ""}
            onChange={(e) => patch({ previewVideo: e.target.value })}
            placeholder="https://… une démo de la formation"
          />
        </Field>

        {listField(t("admin.formations.f.objectives"), draft.objectives, "objectives")}
        {listField(t("admin.formations.f.skills"), draft.skills, "skills")}
        {listField(t("admin.formations.f.prerequisites"), draft.prerequisites, "prerequisites")}

        <div className="rounded-2xl border border-border bg-muted/40 p-4">
          <Field label="Formateur">
            <select
              className={fieldCls}
              value={draft.formateurId ?? ""}
              onChange={(e) => patch({ formateurId: e.target.value })}
            >
              <option value="">Sélectionner un formateur…</option>
              {formateurs.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.fullName} ({f.email})
                </option>
              ))}
            </select>
          </Field>
          {draft.formateurId && (
            <p className="mt-2 text-xs text-muted-foreground">
              Le profil (bio, spécialité, expérience) est géré dans le formulaire utilisateur formateur.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-muted/40 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-display text-sm font-bold text-foreground">
                {t("admin.formations.f.chapters")}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {draft.chapters.length} chapitres · {totalCapsulesCount} capsules vidéo
              </p>
            </div>
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
              <div key={ch.id} className="rounded-xl border border-border bg-card p-5">
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
                <div className="mt-4 space-y-4 ps-9">
                  {ch.capsules.map((c, j) => {
                    const k = capKey(i, j);
                    const mode = capMode(i, j);
                    const busy = !!uploading[k];
                    const ok = !!uploadOk[k];
                    const err = uploadErr[k];
                    return (
                      <div
                        key={c.id}
                        className="rounded-xl border border-border/80 bg-muted/50 p-5 shadow-card-sm"
                      >
                        <div className="grid gap-2 sm:grid-cols-[auto_1fr_100px_auto]">
                          <span className="inline-flex h-8 w-8 shrink-0 self-center items-center justify-center rounded-full bg-card text-[11px] font-bold text-foreground">
                            {c.order}
                          </span>
                          <input
                            className={fieldCls}
                            value={c.title}
                            onChange={(e) => updateCapsule(i, j, { title: e.target.value })}
                            placeholder={t("admin.formations.capsule")}
                          />
                          <div className="relative">
                            <input
                              type="number"
                              min={1}
                              className={`${fieldCls} pe-10`}
                              value={c.duration}
                              onChange={(e) =>
                                updateCapsule(i, j, { duration: Number(e.target.value) })
                              }
                              placeholder="min"
                            />
                            <span className="pointer-events-none absolute inset-y-0 end-3 inline-flex items-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                              min
                            </span>
                          </div>
                          <IconBtn onClick={() => removeCapsule(i, j)} label="—" danger>
                            <Trash2 className="h-4 w-4" />
                          </IconBtn>
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-[200px_1fr]">
                          <Field label="Miniature capsule">
                            <div className="flex flex-col gap-2">
                              <div className="aspect-video overflow-hidden rounded-lg border border-border bg-card">
                                {c.thumbnail ? (
                                  <img
                                    src={c.thumbnail}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                    <Play className="mr-1 h-4 w-4 opacity-60" /> sans image
                                  </div>
                                )}
                              </div>
                              <input
                                className={fieldCls}
                                value={c.thumbnail ?? ""}
                                onChange={(e) => updateCapsule(i, j, { thumbnail: e.target.value })}
                                placeholder="https://…miniature.jpg"
                              />
                            </div>
                          </Field>

                          <div className="space-y-3">
                            <Field label="Description">
                              <textarea
                                rows={4}
                                className={fieldCls}
                                value={c.description ?? ""}
                                onChange={(e) =>
                                  updateCapsule(i, j, { description: e.target.value })
                                }
                                placeholder="Ce que l'étudiant va apprendre dans cette capsule…"
                              />
                            </Field>

                            <div className="rounded-lg border border-border bg-card p-4">
                              <div className="mb-2 flex items-center justify-between gap-2">
                                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
                                  <Youtube className="h-3.5 w-3.5 text-primary" />
                                  Source vidéo de la capsule
                                </div>
                                <div className="inline-flex overflow-hidden rounded-full border border-border bg-muted/60 text-[11px] font-semibold">
                                  <button
                                    type="button"
                                    onClick={() => setCapMode(i, j, "url")}
                                    className={`inline-flex items-center gap-1 px-3 py-1 transition ${
                                      mode === "url"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-background"
                                    }`}
                                  >
                                    <LinkIcon className="h-3 w-3" /> URL HTTPS
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setCapMode(i, j, "upload")}
                                    className={`inline-flex items-center gap-1 px-3 py-1 transition ${
                                      mode === "upload"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-background"
                                    }`}
                                  >
                                    <Upload className="h-3 w-3" /> Fichier personnel
                                  </button>
                                </div>
                              </div>

                              {mode === "url" && (
                                <div className="space-y-2">
                                  <Field label="Lien HTTPS de la vidéo">
                                    <input
                                      className={fieldCls}
                                      value={c.videoUrl ?? ""}
                                      onChange={(e) =>
                                        updateCapsule(i, j, { videoUrl: e.target.value })
                                      }
                                      placeholder="https://cdn.exemple.com/video.mp4 ou https://youtu.be/…"
                                    />
                                  </Field>
                                  {c.videoUrl && !urlLooksHttps(c.videoUrl) && (
                                    <p className="flex items-start gap-1.5 rounded-md bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-700">
                                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                      Le lien doit commencer par{" "}
                                      <code className="mx-0.5 rounded bg-amber-100 px-1 font-mono">
                                        https://
                                      </code>
                                    </p>
                                  )}
                                </div>
                              )}

                              {mode === "upload" && (
                                <div className="space-y-2">
                                  <label className="block">
                                    <span className="mb-1.5 block text-sm font-medium text-foreground">
                                      Choisir un fichier vidéo
                                    </span>
                                    <input
                                      type="file"
                                      accept="video/*"
                                      disabled={busy}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) void startUpload(i, j, file);
                                        e.target.value = "";
                                      }}
                                      className="block w-full cursor-pointer rounded-xl border border-border bg-background text-xs text-foreground file:me-3 file:cursor-pointer file:rounded-l-xl file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-xs file:font-bold file:text-primary hover:file:bg-primary/20"
                                    />
                                  </label>
                                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                    {busy && (
                                      <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />{" "}
                                        Téléversement en cours…
                                      </span>
                                    )}
                                    {ok && (
                                      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-1 font-semibold text-emerald-700">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> Vidéo téléversée ✓
                                      </span>
                                    )}
                                    {err && (
                                      <span className="flex items-start gap-1.5 rounded-md bg-destructive/10 px-2.5 py-1.5 font-semibold text-destructive">
                                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                        {err}
                                      </span>
                                    )}
                                    <span className="rounded-md bg-muted px-2.5 py-1">
                                      Formats: MP4 / WebM · max 500 Mo
                                    </span>
                                  </div>
                                  {c.videoUrl && (
                                    <div className="rounded-md border border-border bg-muted/60 p-2">
                                      <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                        Vidéo liée à cette capsule :
                                      </p>
                                      <p className="break-all rounded bg-background px-2 py-1 font-mono text-[11px] text-muted-foreground">
                                        {c.videoUrl}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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

        {saving && (
          <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Enregistrement de la formation en base de données…
          </div>
        )}
      </div>
    </Modal>
  );
}
