import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Camera, Check, Loader2 } from "lucide-react";
import { MeShell } from "@/components/me/MeShell";
import { Combobox } from "@/components/ui/combobox";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/mock-auth";
import { COUNTRIES } from "@/lib/countries";
import { NATIVE_LANGUAGES } from "@/lib/languages";

export const Route = createFileRoute("/me/profile")({
  head: () => ({ meta: [{ title: "Mon profil — L'Bled First" }] }),
  component: MyProfile,
});

function MyProfile() {
  const { t } = useI18n();
  const { user, updateProfile, resetPassword } = useAuth();
  const [form, setForm] = useState({ fullName: "", phone: "", country: "", nativeLanguage: "" });
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [password, setPassword] = useState("");
  const [pwSaved, setPwSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    setForm({
      fullName: user.fullName,
      phone: user.phone ?? "",
      country: user.country,
      nativeLanguage: user.nativeLanguage,
    });
    setAvatar(user.avatar);
  }, [user]);

  const inputCls =
    "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

  const pickPhoto = () => fileRef.current?.click();
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result));
    reader.readAsDataURL(file);
  };

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      updateProfile({ ...form, avatar });
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    }, 400);
  };

  const changePassword = () => {
    if (!user || !password.trim()) return;
    resetPassword(user.email, password);
    setPassword("");
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 1800);
  };

  const countryOptions = COUNTRIES.map((c) => ({ value: c.name, label: c.name, hint: c.flag }));
  const languageOptions = NATIVE_LANGUAGES.map((l) => ({ value: l.name, label: l.name }));

  return (
    <MeShell title={t("me.profile.title")}>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Avatar */}
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-card">
          <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-muted">
            {avatar ? (
              <img src={avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="font-display text-4xl font-bold text-primary">
                {user?.fullName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <button
            onClick={pickPhoto}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
          >
            <Camera className="h-3.5 w-3.5" />
            {t("me.profile.changePhoto")}
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
          <p className="mt-4 truncate text-sm font-semibold text-foreground">{user?.fullName}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="mb-4 font-display text-base font-bold text-foreground">{t("me.profile.personal")}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">{t("me.profile.fullName")}</label>
                <input className={inputCls} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">{t("me.profile.phone")}</label>
                <input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">{t("me.profile.country")}</label>
                <Combobox value={form.country} onChange={(v) => setForm({ ...form, country: v })} options={countryOptions} placeholder={t("me.profile.country")} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">{t("me.profile.language")}</label>
                <Combobox value={form.nativeLanguage} onChange={(v) => setForm({ ...form, nativeLanguage: v })} options={languageOptions} placeholder={t("me.profile.language")} />
              </div>
            </div>
            <button
              onClick={save}
              disabled={saving}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-warm transition hover:scale-[1.02] disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saved ? <><Check className="h-4 w-4" /> {t("me.profile.saved")}</> : t("me.profile.save")}
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="mb-4 font-display text-base font-bold text-foreground">{t("me.profile.password")}</h3>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("me.profile.newPassword")}
                className={inputCls}
              />
              <button
                onClick={changePassword}
                disabled={!password.trim()}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-warm transition hover:scale-[1.02] disabled:opacity-60"
              >
                {pwSaved ? <><Check className="h-4 w-4" /> {t("me.profile.saved")}</> : t("me.profile.updatePassword")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MeShell>
  );
}
