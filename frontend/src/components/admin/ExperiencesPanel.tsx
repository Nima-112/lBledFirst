import { Field, fieldCls, IconBtn, Modal, PanelHeader } from "@/components/dashboard/ui";
import { useI18n } from "@/lib/i18n";
import { emptyExperience, MockExperience, MockUser } from "@/lib/mock-auth";
import { MapPin, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

export function ExperiencesPanel({
  experiences,
  users,
  onChange,
}: {
  experiences: MockExperience[];
  users: MockUser[];
  onChange: (n: MockExperience[]) => void;
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<MockExperience | null>(null);
  const [isNew, setIsNew] = useState(false);

  const hosts = users.filter((u) => u.role === "admin" || u.role === "tourist");
  const list = useMemo(() => {
    const q = query.toLowerCase();
    return experiences.filter(
      (e) =>
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.region.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q),
    );
  }, [experiences, query]);

  const startCreate = () => {
    const first = hosts[0]?.id ?? "u-host-1";
    setEditing({ ...emptyExperience(first), status: "draft" });
    setIsNew(true);
  };
  const startEdit = (e: MockExperience) => {
    setEditing({ ...e });
    setIsNew(false);
  };
  const remove = (id: string) => {
    if (!confirm(t("admin.exp.confirmDelete"))) return;
    onChange(experiences.filter((e) => e.id !== id));
  };
  const togglePublish = (e: MockExperience) => {
    onChange(
      experiences.map((x) =>
        x.id === e.id ? { ...x, status: x.status === "published" ? "draft" : "published" } : x,
      ),
    );
  };
  const save = () => {
    if (!editing) return;
    // Enforce draft on creation (business rule)
    const clean: MockExperience = {
      ...editing,
      status: isNew ? "draft" : editing.status,
      program: (editing.program ?? [])
        .map((d, i) => ({ ...d, day: i + 1 }))
        .slice(0, editing.durationDays),
    };
    // Ensure program length == durationDays
    while (clean.program.length < clean.durationDays) {
      clean.program.push({ day: clean.program.length + 1, title: "", description: "", images: [] });
    }
    onChange(
      isNew ? [clean, ...experiences] : experiences.map((e) => (e.id === clean.id ? clean : e)),
    );
    setEditing(null);
    setIsNew(false);
  };

  return (
    <div className="space-y-4">
      <PanelHeader
        title={t("admin.exp.title")}
        subtitle={t("admin.exp.subtitle")}
        query={query}
        setQuery={setQuery}
        onAdd={startCreate}
        addLabel={t("admin.exp.add")}
      />

      {list.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center text-sm text-muted-foreground">
          {t("admin.exp.empty")}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((e) => (
          <div
            key={e.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card"
          >
            <div className="relative aspect-video overflow-hidden bg-muted">
              {e.images[0] && (
                <img
                  src={e.images[0]}
                  alt={e.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              )}
              <span
                className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                  e.status === "published" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                }`}
              >
                {e.status}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h4 className="line-clamp-1 font-display text-base font-bold text-foreground">
                {e.title || "—"}
              </h4>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {e.description || "—"}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1">
                  <MapPin className="h-3 w-3" /> {e.region || "—"}
                </span>
                <span className="rounded-md bg-muted/60 px-2 py-1">{e.category}</span>
                <span className="rounded-md bg-muted/60 px-2 py-1">
                  {e.durationDays} {t("acts.dayShort")}
                </span>
                <span className="rounded-md bg-muted/60 px-2 py-1">{e.price} MAD</span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-2">
                <button
                  onClick={() => togglePublish(e)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    e.status === "published"
                      ? "border border-border bg-card text-foreground hover:bg-muted"
                      : "bg-emerald-500 text-white hover:brightness-110"
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {e.status === "published" ? t("admin.exp.unpublish") : t("admin.exp.publish")}
                </button>
                <div className="flex items-center gap-1">
                  <IconBtn label="edit" onClick={() => startEdit(e)}>
                    <Pencil className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn label="delete" danger onClick={() => remove(e.id)}>
                    <Trash2 className="h-4 w-4" />
                  </IconBtn>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={!!editing}
        onClose={() => {
          setEditing(null);
          setIsNew(false);
        }}
        onSave={save}
        title={isNew ? t("admin.exp.createTitle") : t("admin.exp.editTitle")}
      >
        {editing && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t("admin.exp.f.title")}>
                <input
                  className={fieldCls}
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </Field>
              <Field label={t("admin.exp.f.category")}>
                <input
                  className={fieldCls}
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                />
              </Field>
              <Field label={t("admin.exp.f.region")}>
                <input
                  className={fieldCls}
                  value={editing.region}
                  onChange={(e) => setEditing({ ...editing, region: e.target.value })}
                />
              </Field>
              <Field label={t("admin.exp.f.host")}>
                <select
                  className={fieldCls}
                  value={editing.hostId}
                  onChange={(e) => setEditing({ ...editing, hostId: e.target.value })}
                >
                  {hosts.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.fullName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t("admin.exp.f.price")}>
                <input
                  type="number"
                  className={fieldCls}
                  value={editing.price}
                  onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                />
              </Field>
              <Field label={t("admin.exp.f.duration")}>
                <input
                  type="number"
                  min={1}
                  className={fieldCls}
                  value={editing.durationDays}
                  onChange={(e) =>
                    setEditing({ ...editing, durationDays: Math.max(1, Number(e.target.value)) })
                  }
                />
              </Field>
            </div>
            <Field label={t("admin.exp.f.description")}>
              <textarea
                rows={4}
                className={fieldCls}
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </Field>
            <Field label={t("admin.exp.f.images")}>
              <textarea
                rows={3}
                className={fieldCls}
                value={editing.images.join("\n")}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    images: e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </Field>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-display text-sm font-bold text-foreground">
                  {t("admin.exp.f.program")}
                </h4>
                <button
                  type="button"
                  onClick={() =>
                    setEditing({
                      ...editing,
                      durationDays: editing.durationDays + 1,
                      program: [
                        ...editing.program,
                        { day: editing.program.length + 1, title: "", description: "", images: [] },
                      ],
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
                >
                  <Plus className="h-3.5 w-3.5" /> {t("admin.exp.f.addDay")}
                </button>
              </div>
              <div className="space-y-3">
                {editing.program.map((d, i) => (
                  <div key={i} className="rounded-xl border border-border bg-muted/30 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary">
                        {t("exp.detail.day")} {i + 1}
                      </span>
                      {editing.program.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditing({
                              ...editing,
                              durationDays: Math.max(1, editing.durationDays - 1),
                              program: editing.program.filter((_, j) => j !== i),
                            })
                          }
                          className="inline-flex items-center gap-1 text-xs font-semibold text-destructive hover:underline"
                        >
                          <Trash2 className="h-3 w-3" /> {t("admin.exp.f.removeDay")}
                        </button>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <input
                        className={fieldCls}
                        placeholder={t("admin.exp.f.dayTitle")}
                        value={d.title}
                        onChange={(e) => {
                          const p = [...editing.program];
                          p[i] = { ...p[i], title: e.target.value };
                          setEditing({ ...editing, program: p });
                        }}
                      />
                      <textarea
                        rows={2}
                        className={fieldCls}
                        placeholder={t("admin.exp.f.dayDescription")}
                        value={d.description}
                        onChange={(e) => {
                          const p = [...editing.program];
                          p[i] = { ...p[i], description: e.target.value };
                          setEditing({ ...editing, program: p });
                        }}
                      />
                      <textarea
                        rows={2}
                        className={fieldCls}
                        placeholder={t("admin.exp.f.dayImages")}
                        value={d.images.join("\n")}
                        onChange={(e) => {
                          const p = [...editing.program];
                          p[i] = {
                            ...p[i],
                            images: e.target.value
                              .split("\n")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          };
                          setEditing({ ...editing, program: p });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}